import p5 from "p5";
import { Delaunay, line, polygonArea, polygonCentroid } from "d3";
import "./style.css";

const GAP = 10;
const INNER_GAP = GAP * 10;

const spacing = 35;

const strokeWeight = 15;

const sketch = function (p: p5) {
  const getBoundingBox = (polygon: p5.Vector[]) => {
    const x = polygon.map((p) => p.x);
    const y = polygon.map((p) => p.y);
    const minX = p.min(x);
    const minY = p.min(y);
    const maxX = p.max(x);
    const maxY = p.max(y);

    const w = maxX - minX;
    const h = maxY - minY;

    return [w, h];
  };

  const drawVerticalLine = (polygon: p5.Vector[], g: p5.Graphics) => {
    // Determine the scanline range (minX to maxX and minY to maxY)
    let minX = p.min(polygon.map((p) => p.x));
    // let minY = p.min(polygon.map((p) => p.y));

    // g.rotate(p.random(145));

    // Iterate through each scanline within the range
    for (let x = minX + spacing / 2; x < p.width; x += spacing) {
      const intersections = [];

      // Find intersections between the scanline and the polygon edges
      for (let i = 0; i < polygon.length; i++) {
        let j = (i + 1) % polygon.length;
        let x1 = polygon[i].x;
        let y1 = polygon[i].y;
        let x2 = polygon[j].x;
        let y2 = polygon[j].y;

        // Check if the scanline intersects with this edge
        if ((x1 <= x && x2 >= x) || (x2 <= x && x1 >= x)) {
          // Calculate the y-coordinate of the intersection point based on the angle
          const yIntersect = y1 + ((x - x1) / (x2 - x1)) * (y2 - y1);

          intersections.push({ x, y: yIntersect });
        }
      }

      // Sort the intersection points by their y-coordinate
      intersections.sort((a, b) => a.y - b.y);

      g.stroke("red");
      g.strokeWeight(strokeWeight);

      // Draw lines between pairs of intersection points
      for (let i = 0; i < intersections.length; i += 2) {
        let p1 = intersections[i];
        let p2 = intersections[i + 1];
        g.line(p1.x, p1.y, p2.x, p2.y);
      }
    }
  };

  const drawMaskedLines = (
    polygon: p5.Vector[],
    polygonCentroid: p5.Vector
  ) => {
    const polygonCanvas: p5.Graphics = p.createGraphics(1500, 1500);
    polygonCanvas.noFill();
    polygonCanvas.stroke("black");
    polygonCanvas.strokeWeight(strokeWeight);

    polygonCanvas.beginShape();
    for (let v of polygon) {
      polygonCanvas.vertex(v.x, v.y);
    }
    polygonCanvas.endShape(p.CLOSE);

    // const [w, h] = getBoundingBox(polygon);

    const lineCanvas = p.createGraphics(2500, 2500);

    lineCanvas.rectMode(p.CENTER);
    lineCanvas.angleMode(p.DEGREES);

    lineCanvas.translate(polygonCentroid.x / 2, polygonCentroid.y / 2);

    lineCanvas.rotate(45);

    // TODO: I don't need to do scan lines here
    drawVerticalLine(
      [
        p.createVector(0, 0),
        p.createVector(0, 2000),
        p.createVector(2500, 2500),
        p.createVector(2500, 0),
        p.createVector(0, 0),
      ],
      // polygon,
      lineCanvas
    );

    lineCanvas.strokeWeight(20);
    lineCanvas.stroke("green");
    lineCanvas.line(0, 0, 1000, 0);
    lineCanvas.stroke("purple");
    lineCanvas.line(0, 1250, 0, 0);
    lineCanvas.line(1250, 0, 1250, 1250);

    // clip the polygon
    polygonCanvas.erase();
    polygonCanvas.drawingContext.clip();

    // copy layers
    polygonCanvas.image(lineCanvas, 0, 0, lineCanvas.width, lineCanvas.height);
    p.image(polygonCanvas, 0, 0, polygonCanvas.width, polygonCanvas.height);

    lineCanvas.remove();
    polygonCanvas.remove();
  };

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);

    p.background("white");
    p.angleMode(p.DEGREES);

    // const vertices: Array<Delaunay.Point> = range(30).map(() => [
    //   p.random(p.width + GAP),
    //   p.random(p.height + GAP),
    // ]);

    const vertices: Delaunay.Point[] = [
      [622.0824949284857, 569.5759096879713],
      [996.0801818424301, 958.261973126669],
      [375.33364111569836, 806.5359594036025],
      [1247.4767304552486, 283.24008668112265],
      [953.718064967969, 1189.9132967561777],
    ];

    let delaunay = Delaunay.from(vertices);

    const bounds: Delaunay.Bounds = [
      INNER_GAP / 2,
      INNER_GAP / 2,
      p.width - INNER_GAP / 2,
      p.height - INNER_GAP / 2,
    ];

    const voronoi = delaunay.voronoi(bounds);

    p.stroke("black");
    p.strokeWeight(strokeWeight);

    p.rect(GAP, GAP, p.width - GAP * 2, p.height - GAP * 2);
    p.rect(
      INNER_GAP / 2,
      INNER_GAP / 2,
      p.width - INNER_GAP,
      p.height - INNER_GAP
    );

    p.stroke("black");

    for (let polygon of voronoi.cellPolygons()) {
      const area = -polygonArea(polygon);
      // console.log(area);
      if (area < 15000) {
        for (let vertex of polygon) {
          const pointIndex = delaunay.find(vertex[0], vertex[1]);
          vertices.splice(pointIndex, 1);
        }
      }
    }

    const updatedVoronoi = Delaunay.from(vertices).voronoi(bounds);

    for (let polygon of updatedVoronoi.cellPolygons()) {
      // const area = -polygonArea(polygon);
      // console.log(area);
      // p.beginShape();
      // p.strokeWeight(strokeWeight);
      // // p.stroke("red");
      // for (let v of polygon) {
      //   p.vertex(v[0], v[1]);
      // }
      // p.endShape(p.CLOSE);

      const [centroidX, centroidY] = polygonCentroid(polygon);
      const centroid = p.createVector(centroidX, centroidY);

      p.stroke("blue");
      p.point(centroidX, centroidY);

      drawMaskedLines(
        polygon.map(([x, y]) => p.createVector(x, y)),
        centroid
      );
    }
  };
};

new p5(sketch);
