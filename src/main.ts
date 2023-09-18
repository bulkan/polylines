import p5 from "p5";
import { Delaunay, range } from "d3";
import "./style.css";

const GAP = 10;
const INNER_GAP = GAP * 10;
const LINE_SPACING = 45;
const STROKE_WEIGHT = 15;

const sketch = function (p: p5) {
  const drawMaskedLines = (polygon: p5.Vector[]) => {
    const w = 1500;
    const h = 1500;
    const polygonCanvas: p5.Graphics = p.createGraphics(w, h);
    polygonCanvas.noFill();
    polygonCanvas.stroke("black");
    polygonCanvas.strokeWeight(STROKE_WEIGHT);

    // Draw the polygon
    polygonCanvas.beginShape();
    for (let v of polygon) {
      polygonCanvas.vertex(v.x, v.y);
    }
    polygonCanvas.endShape(p.CLOSE);

    const lineCanvas = p.createGraphics(w, h);

    lineCanvas.rectMode(p.CENTER);
    lineCanvas.angleMode(p.DEGREES);
    lineCanvas.noFill();
    lineCanvas.stroke("black");
    lineCanvas.rotate(p.random(-90));
    lineCanvas.translate(-w, LINE_SPACING);

    lineCanvas.strokeWeight(STROKE_WEIGHT);

    for (let x = 0; x < w * 2; x += LINE_SPACING) {
      lineCanvas.line(x, 0, x, h * 2);
    }

    // clip the polygon
    polygonCanvas.drawingContext.clip();

    // copy layers
    polygonCanvas.copy(
      lineCanvas,
      0,
      0,
      lineCanvas.width,
      lineCanvas.height,
      0,
      0,
      polygonCanvas.width,
      polygonCanvas.height
    );

    p.image(polygonCanvas, 0, 0, polygonCanvas.width, polygonCanvas.height);

    lineCanvas.remove();
    polygonCanvas.remove();
  };

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);

    p.background("white");
    p.angleMode(p.DEGREES);

    const vertices: Array<Delaunay.Point> = range(30).map(() => [
      p.random(p.width + GAP),
      p.random(p.height + GAP),
    ]);

    // Hard coded test vertices to create a Delaunay
    // const vertices: Delaunay.Point[] = [
    //   [622.0824949284857, 569.5759096879713],
    //   [996.0801818424301, 958.261973126669],
    //   [375.33364111569836, 806.5359594036025],
    //   [1247.4767304552486, 283.24008668112265],
    //   [953.718064967969, 1189.9132967561777],
    // ];

    let delaunay = Delaunay.from(vertices);

    const bounds: Delaunay.Bounds = [
      INNER_GAP / 2,
      INNER_GAP / 2,
      p.width - INNER_GAP / 2,
      p.height - INNER_GAP / 2,
    ];

    const voronoi = delaunay.voronoi(bounds);

    p.stroke("black");
    p.strokeWeight(STROKE_WEIGHT);

    p.rect(GAP, GAP, p.width - GAP * 2, p.height - GAP * 2);
    p.rect(
      INNER_GAP / 2,
      INNER_GAP / 2,
      p.width - INNER_GAP,
      p.height - INNER_GAP
    );

    p.stroke("black");

    // An expirement to remove polygons with "small" area
    // for (let polygon of voronoi.cellPolygons()) {
    //   const area = -polygonArea(polygon);
    //   // console.log(area);
    //   if (area < 15000) {
    //     for (let vertex of polygon) {
    //       const pointIndex = delaunay.find(vertex[0], vertex[1]);
    //       vertices.splice(pointIndex, 1);
    //     }
    //   }
    // }

    // const updatedVoronoi = Delaunay.from(vertices).voronoi(bounds);

    for (let polygon of voronoi.cellPolygons()) {
      // const area = -polygonArea(polygon);
      drawMaskedLines(polygon.map(([x, y]) => p.createVector(x, y)));
    }
  };
};

new p5(sketch);
