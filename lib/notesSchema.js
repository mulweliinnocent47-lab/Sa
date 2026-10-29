import { defaultSchema } from "rehype-sanitize";

// Allow safe HTML + inline SVG (for diagrams such as box plots) but no scripts,
// event handlers, styles or javascript: URLs.
const SVG_TAGS = ["svg", "g", "line", "rect", "circle", "ellipse", "path", "polyline", "polygon", "text", "tspan", "desc"];
const SVG_ATTRS = [
  "viewBox", "xmlns", "width", "height", "x", "y", "x1", "x2", "y1", "y2", "cx", "cy", "r", "rx", "ry",
  "d", "points", "fill", "stroke", "strokeWidth", "strokeLinecap", "strokeLinejoin", "strokeDasharray",
  "strokeOpacity", "fillOpacity", "opacity", "fontSize", "fontWeight", "fontFamily", "textAnchor",
  "dominantBaseline", "transform", "preserveAspectRatio", "role", "ariaLabel", "dx", "dy",
];

export const notesSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), ...SVG_TAGS, "figure", "figcaption", "details", "summary", "mark", "u"],
  attributes: {
    ...defaultSchema.attributes,
    "*": [...((defaultSchema.attributes && defaultSchema.attributes["*"]) || []), "className"],
    svg: SVG_ATTRS,
    g: SVG_ATTRS,
    line: SVG_ATTRS,
    rect: SVG_ATTRS,
    circle: SVG_ATTRS,
    ellipse: SVG_ATTRS,
    path: SVG_ATTRS,
    polyline: SVG_ATTRS,
    polygon: SVG_ATTRS,
    text: SVG_ATTRS,
    tspan: SVG_ATTRS,
    // KaTeX output is added after sanitising, so it needs no entries here.
  },
};
