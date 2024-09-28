import java.io.IOException;


public class Main {
    public static void main(String[] args) throws IOException {

        Server server = new Server();
        while (true) {
            server.sendResponse();
        }
    }
}
