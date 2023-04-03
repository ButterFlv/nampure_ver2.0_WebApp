"use strict";

class Algorithm{
  constructor(){
    this.beforeBoard=[];
    while(this.beforeBoard.length<81){ this.beforeBoard.push(0); };
    this.resultBoard=[];
    while(this.resultBoard.length<81){ this.resultBoard.push(0); };
  };
  setClass(_draw, _panel){
    this.draw=_draw;
    this.panel=_panel;
  };
  changeBoard(_index, number){
    this.beforeBoard[_index]=number;
  };
  clearBoard(_index){
    this.beforeBoard[_index]=0;
  };
  start(){
    requestAnimationFrame(()=>{
      const nppa=new NPPA({
        board: this.beforeBoard,
        limit: null,
        success:(obj)=>{
          this.resultBoard=[...obj.changed];
        },
      });
    });
  };
};
