import linesFrag from "./lines-into-atlas/lines-into-atlas.frag.glsl";
import linesVert from "./lines-into-atlas/lines-into-atlas.vert.glsl";
import rawSliceFrag from "./slice/raw-slice.frag.glsl";
import sliceFrag from "./slice/slice.frag.glsl";
import sliceVert from "./slice/slice.vert.glsl";
import voxelFrag from "./voxel-into-atlas/voxel-into-atlas.frag.glsl";
import voxelVert from "./voxel-into-atlas/voxel-into-atlas.vert.glsl";

export const linesFragmentShader = linesFrag;
export const linesVertexShader = linesVert;
export const rawSliceFragmentShader = rawSliceFrag;
export const rawSliceVertexShader = sliceVert;
export const sliceFragmentShader = sliceFrag;
export const sliceVertexShader = sliceVert;
export const voxelFragmentShader = voxelFrag;
export const voxelVertexShader = voxelVert;
