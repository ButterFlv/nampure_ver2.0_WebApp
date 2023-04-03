"use strict";

console.log("main.js is loaded.");

window.addEventListener("load",()=>{
  requestAnimationFrame(()=>{ load(); });
},false);

const layoutJSON=`
{
  "drawAreaWidth":1000,
  "margine": 8,
  "boldLineWidth": 6,
  "thinLineWidth": 2,
  "circleRadius": 64,
  "startButtonColor":"red",
  "clearButtonColor":"blue"
}
`;

const load=()=>{
  const set=JSON.parse(layoutJSON);
  window.layout={...set};
  layout.oneBlock=(layout.drawAreaWidth
                    -layout.margine*2
                      -layout.boldLineWidth*4
                        -layout.thinLineWidth*6)/9;
  layout.drawAreaHeight=layout.oneBlock*11
                          +layout.margine*3
                            +layout.boldLineWidth*6
                              +layout.thinLineWidth*6
                                +layout.circleRadius*2;

  const butter=new butterjs({
    id: "myCanvas",
    resize: "window-size",
    aspect: [layout.drawAreaWidth, layout.drawAreaHeight],
    drawAreaWidth: layout.drawAreaWidth,
    quality: "user-2",
    preventContextmenu: true,
    preventScroll: true,
  });
  const can=butter.getCanvas();
  const con=butter.getContext();

  let doneFlag=false;

  const draw=new Draw(butter);
  const panel=new Panel(butter);
  const algorithm=new Algorithm();
  draw.setClass(panel, algorithm);
  panel.setClass(draw, algorithm);
  algorithm.setClass(draw, panel);
  
  draw.drawLoop();
};
