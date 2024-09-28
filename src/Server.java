import com.fastcgi.FCGIInterface;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.logging.Level;
import java.util.logging.Logger;

public class Server {

    public float[] readRequest() throws IOException {

        FCGIInterface.request.inStream.fill();

        var contentLength = FCGIInterface.request.inStream.available();
        var buffer = ByteBuffer.allocate(contentLength);
        var readBytes = FCGIInterface.request.inStream.read(buffer.array(), 0, contentLength);

        var requestBodyRaw = new byte[readBytes];
        buffer.get(requestBodyRaw);
        buffer.clear();

        var request = new String(requestBodyRaw, StandardCharsets.UTF_8);
        String[] parsedRequest = request.replace("{", "").replace("}", "").split(",");

        float[] values = new float[3];
        values[0] = Float.parseFloat(parsedRequest[0].split(":")[1].trim());
        values[1] = Float.parseFloat(parsedRequest[1].split(":")[1].trim());

        values[2] = Float.parseFloat(parsedRequest[2].split(":")[1].trim());

        return values;

    }
    public void sendResponse() throws IOException {

        var fcgiInterface = new FCGIInterface();
        while (fcgiInterface.FCGIaccept() >= 0) {
            double start = System.nanoTime();
            var values = readRequest();
            float x = values[0];
            float y = values[1];
            float r = values[2];
            var status = PointChecker.isInside(x, y ,r);
            double end = System.nanoTime();
            var content = """
                    {
                    
                    "status": %s,
                    "time": %s,
                    "x": %.1f,
                    "y": %.4f,
                    "r": %.1f
                    
                    }
                    """.formatted(status, String.format("%.5f", (end - start)/1000000000), x, y, r);

            var httpResponse = """
                        HTTP/1.1 200 OK
                        Content-Type: application/json
                        Content-Length: %d
                        
                        %s
                        """.formatted(content.getBytes(StandardCharsets.UTF_8).length, content);
            Logger logger = Logger.getLogger("sfsd");
            logger.log(Level.INFO, httpResponse);
            System.out.println(httpResponse);

        }
    }
}


