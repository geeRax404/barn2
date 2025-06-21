import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

declare module '@react-three/fiber' {
  namespace JSX {
    interface IntrinsicElements {
      line2: ReactThreeFiber.Object3DNode<Line2, typeof Line2>;
      lineMaterial: ReactThreeFiber.MaterialNode<LineMaterial, typeof LineMaterial>;
      lineGeometry: ReactThreeFiber.BufferGeometryNode<LineGeometry, typeof LineGeometry>;
    }
  }
}