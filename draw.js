"use strict";

console.log("draw.js is loaded.");

class Draw{
  constructor(_butter){
    this.butter=_butter;
    this.layout=JSON.parse(JSON.stringify(window.layout));

    this.focusIndex=null;
    this.focusColor="yellow";
    this.beforeColor="black";
    this.resultColor="red";
    this.fontSize=70;
  };
  drawLoop(){
    this.drawBackGround();
    this.drawFrame();
    this.drawSelect();
    this.drawNumber();

    requestAnimationFrame(()=>{ this.drawLoop(); });
  };
  drawBackGround(){
    const b=this.butter;
    b.fillStyle="white";
    b.fillAll();
  };
  drawFrame(){
    const b=this.butter;
    const l=this.layout;
    /* 太い線の描画(四角形で表現) */
    for(let i=0;i<4;i++){
      b.fillStyle="black";
      b.fillRect(l.margine+(l.boldLineWidth+l.oneBlock*3+l.thinLineWidth*2)*i,
                  l.margine, l.boldLineWidth, l.boldLineWidth*4+l.oneBlock*9+l.thinLineWidth*6);
      b.fillRect(l.margine, l.margine+(l.boldLineWidth+l.oneBlock*3+l.thinLineWidth*2)*i,
                  l.boldLineWidth*4+l.oneBlock*9+l.thinLineWidth*6, l.boldLineWidth);
      b.fillRect(l.margine+(l.boldLineWidth+l.oneBlock*3+l.thinLineWidth*2)*i,
                  l.margine+l.boldLineWidth*4+l.oneBlock*10+l.thinLineWidth*6,
                    l.boldLineWidth, l.boldLineWidth*2+l.oneBlock);
      b.fillRect(l.margine, l.margine+l.boldLineWidth*4+l.oneBlock*10+l.thinLineWidth*6
                              +(l.boldLineWidth+l.oneBlock)*(i%2),
                  l.boldLineWidth*4+l.oneBlock*9+l.thinLineWidth*6, l.boldLineWidth);
    };
    /* 細い線の描画(四角形で表現) */
    for(let i=0;i<3;i++){
      for(let j=0;j<2;j++){
        b.fillRect(l.margine+l.boldLineWidth+l.oneBlock+(l.thinLineWidth*2+l.oneBlock*3+l.boldLineWidth)*i
                                      +(l.thinLineWidth+l.oneBlock)*j,
                    l.margine, l.thinLineWidth, l.boldLineWidth*4+l.thinLineWidth*6+l.oneBlock*9);
        b.fillRect(l.margine, l.margine+l.boldLineWidth+l.oneBlock+(l.thinLineWidth*2+l.oneBlock*3+l.boldLineWidth)*i
                                      +(l.thinLineWidth+l.oneBlock)*j,
                    l.boldLineWidth*4+l.thinLineWidth*6+l.oneBlock*9, l.thinLineWidth);
        b.fillRect(l.margine+l.boldLineWidth+l.oneBlock+(l.thinLineWidth*2+l.oneBlock*3+l.boldLineWidth)*i
                                      +(l.thinLineWidth+l.oneBlock)*j,
                    l.margine+l.boldLineWidth*4+l.oneBlock*10+l.thinLineWidth*6,
                      l.thinLineWidth, l.boldLineWidth*2+l.oneBlock);
      };
    };
    /* 円の描画 */
    b.fillStyle=l.startButtonColor;
    b.fillArc(l.drawAreaWidth/4*3, l.margine*2+l.oneBlock*11+l.boldLineWidth*6+l.thinLineWidth*6+l.circleRadius, l.circleRadius);
    b.fillStyle=l.clearButtonColor;
    b.fillArc(l.drawAreaWidth/4, l.margine*2+l.oneBlock*11+l.boldLineWidth*6+l.thinLineWidth*6+l.circleRadius, l.circleRadius);
  };
  drawSelect(){
    if(this.focusIndex===null){ return; };
    const x=this.focusIndex%9; const y=(this.focusIndex-x)/9;
    const panel=this.panel;
    const b=this.butter;
    b.fillStyle=this.focusColor;
    b.fillRect(panel.nomalBorders[x*2], panel.nomalBorders[y*2],
                panel.nomalBorders[x*2+1]-panel.nomalBorders[x*2],
                  panel.nomalBorders[y*2+1]-panel.nomalBorders[y*2]);
  };
  drawNumber(){
    const before=this.algorithm.beforeBoard;
    const result=this.algorithm.resultBoard;
    const rate=this.butter.getRate();
    const panel=this.panel;
    const con=this.butter.getContext();
    for(let i=0;i<81;i++){
      if(before[i]!==0){
        const x=i%9; const y=(i-x)/9;
        const drawX=rate.width*(panel.nomalBorders[x*2]+(panel.nomalBorders[x*2+1]-panel.nomalBorders[x*2])/2);
        const drawY=rate.height*(panel.nomalBorders[y*2]+(panel.nomalBorders[y*2+1]-panel.nomalBorders[y*2])/2);
        con.textAlign="center";
        con.textBaseline="middle";
        con.fillStyle=this.beforeColor;
        con.font=`${this.fontSize*rate.width}px arial`;
        con.fillText(before[i], drawX, drawY);
      };
    };

    for(let i=0;i<81;i++){
      if(result[i]!==0){
        const x=i%9; const y=(i-x)/9;
        const drawX=rate.width*(panel.nomalBorders[x*2]+(panel.nomalBorders[x*2+1]-panel.nomalBorders[x*2])/2);
        const drawY=rate.height*(panel.nomalBorders[y*2]+(panel.nomalBorders[y*2+1]-panel.nomalBorders[y*2])/2);
        con.textAlign="center";
        con.textBaseline="middle";
        con.fillStyle=this.resultColor;
        con.font=`${this.fontSize*rate.width}px arial`;
        con.fillText(result[i], drawX, drawY);
      };
    };

    /* 下のところの数字 */
    for(let i=0;i<9;i++){
      con.textAlign="center";
      con.textBaseline="middle";
      con.fillStyle=this.beforeColor;
      con.font=`${this.fontSize*rate.width}px arial`;
      const drawX=rate.width*(panel.nomalBorders[i*2]+(panel.nomalBorders[i*2+1]-panel.nomalBorders[i*2])/2);
      const drawY=rate.height*(panel.specialBordersY[0]+(panel.specialBordersY[1]-panel.specialBordersY[0])/2);
      con.fillText(i+1, drawX, drawY);
    };
  };
  setClass(_panel, _algorithm){
    this.panel=_panel;
    this.algorithm=_algorithm;
  };
  changeBoard(_index){
    this.focusIndex=_index;
  };
};
