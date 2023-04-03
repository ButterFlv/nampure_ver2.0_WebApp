"use strict";

class Panel{
  constructor(_butter){
    this.butter=_butter;
    this.focusIndex=null;

    this.startAbleFlag=true;

    this.setEventListener();
  };
  setEventListener(){
    const can=this.butter.getCanvas();
    can.addEventListener("click",(e)=>{ this.click(e); },false);
    
    const l=JSON.parse(JSON.stringify(window.layout));
    
    /* 標準の境界線を */
    this.nomalBorders=[l.margine+l.boldLineWidth];
    for(let i=0;i<3;i++){
      for(let j=0;j<2;j++){
        this.nomalBorders.push(this.nomalBorders[this.nomalBorders.length-1]+l.oneBlock);
        this.nomalBorders.push(this.nomalBorders[this.nomalBorders.length-1]+l.thinLineWidth);
      };
      this.nomalBorders.push(this.nomalBorders[this.nomalBorders.length-1]+l.oneBlock);
      this.nomalBorders.push(this.nomalBorders[this.nomalBorders.length-1]+l.boldLineWidth);
    };
    this.specialBordersY=[l.margine+l.boldLineWidth*6+l.thinLineWidth*6+l.oneBlock*10];
    this.specialBordersY.push(this.specialBordersY[0]+l.oneBlock);
    this.circleCenterPoint=[l.drawAreaWidth/4*3, l.margine*2+l.boldLineWidth*6+l.thinLineWidth*6+l.oneBlock*11+l.circleRadius];
    this.clearButtonPoint=[l.drawAreaWidth/4, l.margine*2+l.boldLineWidth*6+l.thinLineWidth*6+l.oneBlock*11+l.circleRadius];
  };
  click(e){
    const l=JSON.parse(JSON.stringify(window.layout));
    const can=this.butter.getCanvas();
    const canWidth=Number(can.style.width.slice(0, -2));
    const canHeight=Number(can.style.height.slice(0, -2));
    const clickX=e.offsetX*l.drawAreaWidth/canWidth;
    const clickY=e.offsetY*l.drawAreaHeight/canHeight;
    console.log(clickX, clickY);

    let x=null; let y=null;
    const nomalBorders=this.nomalBorders;
    const specialBordersY=this.specialBordersY;
    const circleCenterPoint=this.circleCenterPoint;
    const clearButtonPoint=this.clearButtonPoint;

    if((clickX-circleCenterPoint[0])**2+(clickY-circleCenterPoint[1])**2<l.circleRadius**2){
      this.pushStart(); return;
    };
    if((clickX-clearButtonPoint[0])**2+(clickY-clearButtonPoint[1])**2<l.circleRadius**2){
      this.clear(); return;
    };
    for(let i=0;i<9;i++){
      if(nomalBorders[2*i]<=clickX && clickX<=nomalBorders[2*i+1]){ x=i; };
      if(nomalBorders[2*i]<=clickY && clickY<=nomalBorders[2*i+1]){ y=i; };
    };
    if(x!==null && y!==null){ this.pushBoard(x+y*9); return; };
    if(y===null && specialBordersY[0]<=clickY && clickY<=specialBordersY[1]){ this.pushInsert(x+1); return; };
  };
  clear(){
    if(!(this.startAbleFlag)){ return; };
    console.log("clear");
    if(this.focusIndex===null){ return; };
    this.algorithm.clearBoard(this.focusIndex);
  };
  pushStart(){
    if(!(this.startAbleFlag)){ return; };
    console.log("start");
    this.focusIndex=null;
    this.draw.focusIndex=null;
    this.algorithm.start();
    this.startAbleFlag=false;
  };
  pushBoard(_index){
    if(!(this.startAbleFlag)){ return; };
    console.log(`board: ${_index}`);
    this.focusIndex=_index;
    this.draw.changeBoard(_index);
  };
  pushInsert(_index){
    if(!(this.startAbleFlag)){ return; };
    console.log(`insert: ${_index}`);
    if(this.focusIndex===null){ return; };
    this.algorithm.changeBoard(this.focusIndex, _index);
  };
  setClass(_draw, _algorithm){
    this.draw=_draw;
    this.algorithm=_algorithm;
  };
};
