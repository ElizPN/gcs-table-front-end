/// <reference types="react-scripts" />

// Explicit fallback declarations for plain CSS side-effect imports.
// react-scripts types already cover this, but some IDE TS servers don't
// resolve the reference reliably — these belts-and-suspenders the IDE.
declare module '*.css';

