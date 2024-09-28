public class PointChecker {
    public static boolean isInside(double x, double y, double R) {
        // Четверть круга
        if (x >= 0 && y >= 0 && (x * x + y * y <= (R / 2) * (R / 2))) {
            return true;
        }
        // Треугольник
        if (x <= 0 && y >= 0 && y <= x + R / 2) {
            return true;
        }
        // Прямоугольник
        return x <= 0 && x >= -R && y <= 0 && y >= -R / 2;
    }
}
