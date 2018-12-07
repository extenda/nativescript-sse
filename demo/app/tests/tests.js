const SSE = require("@extenda/nativescript-okhttp-sse").SSE;

describe("SSE Test suite", function() {
    it("exists", function() {
        const sse = new SSE("http://localhost:8080/events",{}, {});
        expect(sse.setLastEventId).toBeDefined();
    });
});