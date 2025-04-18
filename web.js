const setup = async (app) => {
    app.get("/chat", async (request, reply) => {
        return reply.sendFile("chat.html");
    });
}
export default { setup };