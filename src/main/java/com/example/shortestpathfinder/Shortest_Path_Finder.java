package com.example.shortestpathfinder;

import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.canvas.Canvas;
import javafx.scene.control.Alert;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.control.Button;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.paint.Color;
import javafx.stage.Stage;
import java.util.*;

public class Shortest_Path_Finder extends Application {
    private static final int CELL_SIZE = 18;
    private static final int WIDTH = 960;
    private static final int HEIGHT = 400;
    private static final int ROWS = HEIGHT / CELL_SIZE;
    private static final int COLS = WIDTH / CELL_SIZE;
    private Set<Integer> obstacles = new HashSet<>();
    private int start = 0;
    private int end = (ROWS * COLS) - 1;
    private List<Integer> path = new ArrayList<>();
    private GraphicsContext gc;
    private Canvas canvas;
    private boolean settingStart = false;
    private boolean settingEnd = false;

    @Override
    public void start(Stage primaryStage) {
        canvas = new Canvas(WIDTH, HEIGHT);
        gc = canvas.getGraphicsContext2D();
        drawGrid();

        canvas.setOnMouseClicked(this::handleMouseClick);

        Button findPathBtn = new Button("Shortest Path");
        findPathBtn.setOnAction(e -> {
            findShortestPath();
            drawGrid();
        });

        Button randomWallsBtn = new Button("Place Walls");
        randomWallsBtn.setOnAction(e -> {
            placeRandomWalls();
            drawGrid();
        });

        Button clearBtn = new Button("Clear");
        clearBtn.setOnAction(e -> {
            obstacles.clear();
            path.clear();
            drawGrid();
        });

        Button setStartBtn = new Button("Set Start");
        setStartBtn.setOnAction(e -> {
            settingStart = true;
            settingEnd = false;
        });

        Button setEndBtn = new Button("Set End");
        setEndBtn.setOnAction(e -> {
            settingStart = false;
            settingEnd = true;
        });

        HBox buttonBox = new HBox(10, findPathBtn, randomWallsBtn, clearBtn, setStartBtn, setEndBtn);
        buttonBox.setStyle("-fx-padding: 10px; -fx-alignment: center;");

        BorderPane root = new BorderPane();
        root.setCenter(canvas);
        root.setBottom(buttonBox);

        Scene scene = new Scene(root);
        primaryStage.setScene(scene);
        primaryStage.setTitle("Shortest Path Finder");
        primaryStage.show();
    }

    private void drawGrid() {
        gc.setFill(Color.WHITE);
        gc.fillRect(0, 0, WIDTH, HEIGHT);

        for (int i = 0; i < ROWS; i++) {
            for (int j = 0; j < COLS; j++) {
                int index = i * COLS + j;
                if (index == start) {
                    gc.setFill(Color.GREEN);
                } else if (index == end) {
                    gc.setFill(Color.BLUE);
                } else if (obstacles.contains(index)) {
                    gc.setFill(Color.BLACK);
                } else if (path.contains(index)) {
                    gc.setFill(Color.AQUA);
                } else {
                    gc.setFill(Color.LIGHTGRAY);
                }
                gc.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
            }
        }
    }

    private void handleMouseClick(MouseEvent event) {
        int col = (int) event.getX() / CELL_SIZE;
        int row = (int) event.getY() / CELL_SIZE;
        int index = row * COLS + col;

        if (settingStart) {
            start = index;
            settingStart = false;
        } else if (settingEnd) {
            end = index;
            settingEnd = false;
        } else if (!obstacles.contains(index) && index != start && index != end) {
            obstacles.add(index);
        }
        drawGrid();
    }

    private void findShortestPath() {
        path.clear();
        Queue<Integer> queue = new LinkedList<>();
        Map<Integer, Integer> parent = new HashMap<>();
        boolean[] visited = new boolean[ROWS * COLS];
        queue.add(start);
        visited[start] = true;

        while (!queue.isEmpty()) {
            int current = queue.poll();
            if (current == end) break;
            for (int neighbor : getNeighbors(current)) {
                if (!visited[neighbor]) {
                    queue.add(neighbor);
                    visited[neighbor] = true;
                    parent.put(neighbor, current);
                }
            }
        }

        if (!parent.containsKey(end)) {
            showAlert("No Path Found", "There is no possible path to reach the end point.");
            return;
        }

        Integer step = end;
        while (step != null && step != start) {
            path.add(step);
            step = parent.get(step);
        }
        drawGrid();
    }
    private void showAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.WARNING);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }

    private void placeRandomWalls() {
        Random random = new Random();
        obstacles.clear();
        for (int i = 0; i < (ROWS * COLS) / 5; i++) {
            int index;
            do {
                index = random.nextInt(ROWS * COLS);
            } while (index == start || index == end);
            obstacles.add(index);
        }
    }

    private List<Integer> getNeighbors(int index) {
        List<Integer> neighbors = new ArrayList<>();
        int row = index / COLS;
        int col = index % COLS;
        int[] dr = {-1, 1, 0, 0};
        int[] dc = {0, 0, -1, 1};

        for (int i = 0; i < 4; i++) {
            int newRow = row + dr[i];
            int newCol = col + dc[i];
            int newIndex = newRow * COLS + newCol;
            if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && !obstacles.contains(newIndex)) {
                neighbors.add(newIndex);
            }
        }
        return neighbors;
    }

    public static void main(String[] args) {
        launch(args);
    }
}
