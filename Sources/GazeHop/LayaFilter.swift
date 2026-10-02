import Foundation

/// Optional "smart filter": asks the local Laya server (~/laya/serve.sh, port 8077)
/// whether a detected glance is a real switch of attention. Laya is a text decision
/// model, so it sees a description of the situation, never camera frames.
/// Fails open: if the server is down or slow, the switch goes ahead.
final class LayaFilter {
    private var settings: Settings { .shared }
    var enabled: Bool { settings.layaEnabled }
    private var url: URL? { URL(string: settings.layaURL) }
    private(set) var lastStatus = "not used yet"

    struct Context {
        let fromApp: String, fromTitle: String
        let toApp: String, toTitle: String
        let dwellMs: Int
        let confidence: Double
        let secondsSinceKey: Double
    }

    func shouldSwitch(_ c: Context, completion: @escaping (Bool) -> Void) {
        guard enabled, let url else { completion(true); return }

        let state = """
        The user has two screens. Keyboard focus is on "\(c.fromApp)" (\(c.fromTitle)). \
        Their eyes moved to the other screen showing "\(c.toApp)" (\(c.toTitle)) and stayed \
        there for \(c.dwellMs) ms. Gaze confidence is \(Int(c.confidence * 100))%. \
        Their last keypress was \(String(format: "%.1f", c.secondsSinceKey)) seconds ago.
        """
        let body: [String: Any] = [
            "state": state,
            "questions": [
                "switch": [
                    "type": "noul",
                    "instructions": "Is the user deliberately moving their attention to work on the other screen, rather than briefly glancing at it?",
                ],
            ],
        ]
        var req = URLRequest(url: url, timeoutInterval: 0.4)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "content-type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)

        URLSession.shared.dataTask(with: req) { data, _, error in
            var allow = true
            if let data,
               let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let answers = json["answers"] as? [String: Any],
               let p = Self.probability(answers["switch"]) {
                allow = p >= self.settings.layaThreshold
                self.lastStatus = String(format: "last p=%.2f", p)
            } else {
                self.lastStatus = error == nil ? "bad reply" : "server unreachable"
            }
            DispatchQueue.main.async { completion(allow) }
        }.resume()
    }

    /// One round-trip to check the server is up; reports latency.
    func test(completion: @escaping (String) -> Void) {
        guard let url else { completion("Invalid URL"); return }
        var req = URLRequest(url: url, timeoutInterval: 3)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "content-type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: [
            "state": "connection test",
            "questions": ["ok": ["type": "noul", "instructions": "Is this a test?"]],
        ])
        let start = Date()
        URLSession.shared.dataTask(with: req) { data, _, error in
            let ms = Int(Date().timeIntervalSince(start) * 1000)
            let msg: String
            if let error { msg = "Not reachable: \(error.localizedDescription)" }
            else if let data, (try? JSONSerialization.jsonObject(with: data)) is [String: Any] { msg = "Connected (\(ms) ms)" }
            else { msg = "Server replied, but not like Laya" }
            DispatchQueue.main.async { completion(msg) }
        }.resume()
    }

    /// Laya's noul answer may be a bare number or an object with a probability field.
    private static func probability(_ v: Any?) -> Double? {
        if let d = v as? Double { return d }
        if let o = v as? [String: Any] {
            for k in ["noul", "probability", "p", "value"] {
                if let d = o[k] as? Double { return d }
            }
        }
        return nil
    }
}
