import p5 from "p5";
import { Delaunay, range, polygonArea } from "d3";
import "./style.css";

const GAP = 10;
const INNER_GAP = GAP * 10;

const spacing = 35;

const strokeWeight = 15;

const sketch = function (p: p5) {
  const drawHorizontalLine = (polygon: p5.Vector[]) => {
    const angle = 65;

    // 𝑥=5 cos𝜃,and 𝑦=5 sin𝜃
    // const xAngle = p.cos(angle);
    // const yAngle = p.sin(angle);

    // Determine the scanline range (minY to maxY)
    let minY = p.min(polygon.map((p) => p.y));
    let maxY = p.max(polygon.map((p) => p.y));

    // Iterate through each scanline within the range
    for (let y = minY + spacing; y < maxY; y += spacing) {
      let intersections = [];

      // Find intersections between the scanline and the polygon edges
      for (let i = 0; i < polygon.length; i++) {
        let j = (i + 1) % polygon.length;
        let x1 = polygon[i].x;
        let y1 = polygon[i].y;
        let x2 = polygon[j].x;
        let y2 = polygon[j].y;

        // Check if the scanline intersects with this edge
        if ((y1 <= y && y2 >= y) || (y2 <= y && y1 >= y)) {
          const xIntersect = x1 + ((y - y1) / (y2 - y1)) * (x2 - x1);
          intersections.push(xIntersect);
        }
      }

      // Sort the intersection points in ascending order
      intersections.sort((a, b) => a - b);

      p.stroke("black");
      p.strokeWeight(strokeWeight);

      // Draw lines between pairs of intersection points
      for (let i = 0; i < intersections.length; i += 2) {
        let x1 = intersections[i];
        let x2 = intersections[i + 1];
        p.line(x1, y, x2, y);
      }
    }
  };

  const drawVerticalLine = (polygon: p5.Vector[]) => {
    // Determine the scanline range (minX to maxX and minY to maxY)
    let minX = p.min(polygon.map((p) => p.x));
    // let minY = p.min(polygon.map((p) => p.y));

    // Iterate through each scanline within the range
    for (let x = minX + spacing / 2; x < p.width; x += spacing) {
      let intersections = [];

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
          let yIntersect = y1 + ((x - x1) / (x2 - x1)) * (y2 - y1);

          intersections.push({ x, y: yIntersect });
        }
      }

      // Sort the intersection points by their y-coordinate
      intersections.sort((a, b) => a.y - b.y);

      p.strokeWeight(strokeWeight);
      // p.stroke("");

      // Draw lines between pairs of intersection points
      for (let i = 0; i < intersections.length; i += 2) {
        let p1 = intersections[i];
        let p2 = intersections[i + 1];
        p.line(p1.x, p1.y, p2.x, p2.y);
      }
    }
  };

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background("white");
    p.angleMode(p.RADIANS);

    // const vertices: Array<Delaunay.Point> = range(35).map(() => [
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
      if (area < 20000) {
        for (let vertex of polygon) {
          const pointIndex = delaunay.find(vertex[0], vertex[1]);
          vertices.splice(pointIndex, 1);
        }
      }
    }

    const updatedVoronoi = Delaunay.from(vertices).voronoi(bounds);

    for (let polygon of updatedVoronoi.cellPolygons()) {
      const area = -polygonArea(polygon);
      console.log(area);
      p.beginShape();
      p.strokeWeight(strokeWeight);
      p.stroke("red");
      for (let v of polygon) {
        p.vertex(v[0], v[1]);
      }
      p.endShape(p.CLOSE);
      p.stroke("black");

      // if (p.randomGaussian() > 0.5) {
      // drawVerticalLine(polygon.map((v) => p.createVector(v[0], v[1])));
      // } else {
      drawHorizontalLine(polygon.map((v) => p.createVector(v[0], v[1])));
      // }
    }
  };
};

new p5(sketch);
