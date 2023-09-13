import p5 from "p5";
import { Delaunay, range, polygonArea } from "d3";
import "./style.css";

const GAP = 10;
const INNER_GAP = GAP * 10;

const spacing = 20;

const sketch = function (p: p5) {
  const drawLineWithAngle = (polygon: p5.Vector[], angle: number) => {
    // Determine the scanline range (minY to maxY)
    let minY = p.min(polygon.map((p) => p.y));
    let maxY = p.max(polygon.map((p) => p.y));

    // Iterate through each scanline within the range
    for (let y = minY + spacing / 2; y < maxY; y += spacing) {
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
          let xIntersect = x1 + ((y - y1) / (y2 - y1)) * (x2 - x1);
          intersections.push(xIntersect);
        }
      }

      // Sort the intersection points in ascending order
      intersections.sort((a, b) => a - b);

      p.strokeWeight(10);
      p.stroke("blue");

      // Draw lines between pairs of intersection points
      for (let i = 0; i < intersections.length; i += 2) {
        let x1 = intersections[i];
        let x2 = intersections[i + 1];
        p.line(x1, y, x2, y);
      }
    }
  };

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background("white");
    p.angleMode(p.RADIANS);

    // const vertices: Array<Delaunay.Point> = range(5).map(() => [
    //   p.random(p.width + GAP),
    //   p.random(p.height + GAP),
    // ]);

    const vertices: Delaunay.Point[] = [
      [1197.102094948968, 514.4798064718212],
      [685.948890478042, 645.706104951586],
      [475.55274776576954, 134.6172939223823],
      [639.5734835103027, 1172.9486450146835],
      [199.21034630902588, 704.8478800026426],
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
    p.strokeWeight(20);

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

          // @ts-ignore
          // delaunay.points[pointIndex] = null;
          vertices.splice(pointIndex, 1);
        }
      }
    }

    const updatedVoronoi = Delaunay.from(vertices).voronoi(bounds);

    for (let polygon of updatedVoronoi.cellPolygons()) {
      // const area = -polygonArea(polygon);
      // console.log(area);
      p.beginShape();
      p.strokeWeight(20);
      p.stroke("black");
      for (let v of polygon) {
        p.vertex(v[0], v[1]);
      }
      p.endShape(p.CLOSE);

      drawLineWithAngle(
        polygon.map((v) => p.createVector(v[0], v[1])),
        p.radians(p.random(45, 90))
      );
    }
  };
};

new p5(sketch);
