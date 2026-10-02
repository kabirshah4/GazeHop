import Foundation

/// Optional "smart filter": asks the local Laya server (~/laya/serve.sh, port 8077)
/// whether a detected glance is a real switch of attention. Laya is a text decision
/// model, so it sees a description of the situation, never camera frames.
/// Fails open: if the server is down or slow, the switch goes ahead.
final class LayaFilter {
    var enabled = false
    var threshold = 0.5
    private let url = URL(string: "http://127.0.0.1:8077/decide")!
    private(set) var lastStatus = "off"

    struct Context {
        let fromApp: String, fromTitle: String
        let toApp: String, toTitle: String
        let dwellMs: Int
        let confidence: Double
        let secondsSinceKey: Double
    }

    func shouldSwitch(_ c: Context, completion: @escaping (Bool) -> Void) {
        guard enabled else { completion(true); return }

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
                allow = p >= self.threshold
                self.lastStatus = String(format: "last p=%.2f", p)
            } else {
                self.lastStatus = error == nil ? "bad reply" : "server unreachable"
            }
            DispatchQueue.main.async { completion(allow) }
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
