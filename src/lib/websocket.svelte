<script>
    import { io } from "socket.io-client";
    const socket = io("ws://localhost:3001");
    console.log("Hey ws");
    socket.on("connect", () => {
        console.log("Conectado ws");
    });
    socket.on("require-tokens", () => {
        console.log("Tokens have been required");
    });
</script>