import p5 from "p5";
import { Delaunay, range } from "d3";
import "./style.css";

// The GAP const is to draw the outer and inner frames
const GAP = 5;
const INNER_GAP = GAP * 15;

const WIDTH = 1100;
const HEIGHT = 1100;

const sketch = function (p: p5) {
  // let aOff = 0;

  const canvasWidth = p.windowWidth >= 1274 ? WIDTH : p.windowWidth;
  const canvasHeight = p.windowHeight >= 1168 ? HEIGHT : p.windowHeight;

  const LINE_SPACING = 40;
  const STROKE_WEIGHT = p.map(canvasWidth, 0, p.windowWidth, 25, 10);

  const drawMaskedLines = (polygon: p5.Vector[]) => {
    const polygonCanvas: p5.Graphics = p.createGraphics(WIDTH, HEIGHT);
    polygonCanvas.noFill();
    polygonCanvas.stroke("black");
    polygonCanvas.strokeWeight(STROKE_WEIGHT);

    // Draw the polygon
    polygonCanvas.beginShape();
    for (let v of polygon) {
      polygonCanvas.vertex(v.x, v.y);
    }
    polygonCanvas.endShape(p.CLOSE);

    const lineCanvas = p.createGraphics(WIDTH, HEIGHT);

    lineCanvas.rectMode(p.CENTER);
    lineCanvas.angleMode(p.DEGREES);
    lineCanvas.noFill();
    lineCanvas.stroke("black");
    lineCanvas.rotate(p.random(-45, -90));
    lineCanvas.translate(-WIDTH, LINE_SPACING);
    lineCanvas.strokeWeight(STROKE_WEIGHT);

    // Draw vertical lines into the lineCanvas where the height is much
    // more than is needed
    for (let x = 0; x < WIDTH * 2; x += LINE_SPACING) {
      lineCanvas.line(x, 0, x, HEIGHT * 2);
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

  p.setup = () => {
    const canvasElement = document.getElementById("main-canvas");

    const calloutCard: HTMLDivElement | null =
      document.querySelector(".callout-card");
    if (calloutCard) {
      calloutCard.style.visibility = "visible";
    }

    if (!canvasElement) throw Error("missing canvas");
    p.createCanvas(canvasWidth, canvasHeight, canvasElement);

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
      // aOff += 0.5;
      // const area = -polygonArea(polygon);
      drawMaskedLines(polygon.map(([x, y]) => p.createVector(x, y)));
    }
  };
};

new p5(sketch);
