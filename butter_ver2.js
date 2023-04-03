"use strict";

console.log("butter_ver2.js is loaded.");

class butterjs{
    constructor(set){
        this.set={ ...set };
        this.element={
            canvas: null,
            context: null,
            sub_canvas: [],
            par_element: null,
            par_id: null,
            par_style: null,
        };
        this.property={
            resize_type: null,
            id: null,
            style: null,
            offset_width: null,
            offset_height: null,
            quality_rate: null,
            background_color: "rgb(255, 255, 255)",
            draw_area_width: null,
            draw_area_height: null,
            aspect: null,
            rate: {
                width: null,
                height: null,
            },
        };
        this.temp={};

        /* ユーザーが使うことを想定しない関数 */
        this.funcs={
            resizing: [],   /* リサイズするときの関数をまとめて入れる配列 */
        };

        /* 初期化関数の header ( ユーザーが使うことは想定していないので this.funcs に格納 ) */
        this.initializeFunctionHeader();

        /* イベントリスナーの座標変換用の関数の header ( ユーザーが使うことは想定していないので this.funcs に格納 ) */
        this.eventFunctionHeader();

        /* 初めに行う設定をまとめた関数( A function that summarizes the initial setup ) */
        this.firstSetting();
    };






    firstSetting(){
        this.funcs.documentInitialize();
        this.funcs.qualityRateValueSetting();
        this.funcs.setId();
        this.funcs.setBackGroundColor();
        this.funcs.registParent();
        this.funcs.resizeTypeSet();
        this.funcs.createCanvas();
        this.funcs.appendElement();
        this.funcs.setStyles();

        this.funcs.setResizingFunction();
        this.funcs.resize();
    };








    initializeFunctionHeader(){

        /* ドキュメント初期化関数 */
        this.funcs.documentInitialize=()=>{
            this.funcs.addStyle(`*{ margin: 0; padding: 0; }`);
            /*prevent right click*/
            if(this.set.prevent_contextmenu){
                document.oncontextmenu=()=>{return false;};
            };
            /*prevent scroll*/
            if(this.set.prevent_scroll){
                document.addEventListener('touchmove', function(e){e.preventDefault();}, { passive: false });
                document.addEventListener('mousewheel', function(e){e.preventDefault();}, { passive: false });
            };
        };

        this.funcs.qualityRateValueSetting=()=>{
            if(this.set.quality!==undefined){
                const arr=this.set.quality.split(`-`);
                switch(arr[0]){
                    case `highest`: this.property.quality_rate=1.5;break;
                    case `high`: this.property.quality_rate=1.2;break;
                    case `low`: this.property.quality_rate=0.8;break;
                    case `lowest`: this.property.quality_rate=0.6;break;
                    case `user`: this.property.quality_rate=Number(arr[1]);break;
                    default: this.property.quality_rate=1;break;
                };
            }else{this.property.quality_rate=1;};
        };

        this.funcs.setId=()=>{
            if(this.set.id==undefined){
                this.property.id=`butterjs_create_canvas_${Math.floor(performance.now())}`;
            }else{ this.property.id=this.set.id; };
        };

        this.funcs.setBackGroundColor=()=>{
            if(this.set.backGroundColor!==undefined){
                this.property.background_color=this.set.backGroundColor;
            };
        };

        this.funcs.registParent=()=>{
            if(this.set.resize=="window-size"){
                this.element.par_element=document.createElement("div");
                this.element.par_id=`butterjs_create_parent_${Math.floor(performance.now())}`;
                this.element.par_element.id=this.element.par_id;
            }else if(this.set.resize!==undefined){
                this.element.par_element=document.getElementById(this.set.resize);
                this.element.par_id=this.set.resize;
            }else{
                this.element.par_element=null;
                this.element.par_id=null;
            };
        };

        this.funcs.resizeTypeSet=()=>{
            if(this.set.resize=="window-size"){
                this.property.resize_type="window-size";
            }else if(this.set.resize!==undefined){
                this.property.resize_type="div";
            }else{
                this.property.resize_type=null;
            };
        };

        this.funcs.createCanvas=()=>{
            this.element.canvas=document.createElement("canvas");
            this.element.canvas.id=this.property.id;
            this.element.context=this.element.canvas.getContext("2d");
        };

        this.funcs.appendElement=()=>{
            if(this.property.resize_type=="window-size"){
                document.body.appendChild(this.element.par_element);
                this.element.par_element.appendChild(this.element.canvas);
            }else if(this.property.resize_type=="div"){
                this.element.par_element.appendChild(this.element.canvas);
            }else{document.body.appendChild(this.element.canvas);};
        };

        this.funcs.setStyles=()=>{
            if(this.property.resize_type=="window-size"){
            this.funcs.addStyle(`
                #${this.element.par_id}{
                    position: fixed;
                    width: 100%;
                    height: 100%;
                }
        
                #${this.property.id}{
                    display: block;
                    position: absolute;
                    top:50%;
                    left:50%;
                    transform: translate(-50%, -50%);
                    background-color: ${this.property.background_color};
                }`);
            }else if(this.property.resize_type=="div"){
                this.funcs.addStyle(`
                    #${this.element.par_id} {
                        position: relative;
                    }
    
                    #${this.property.id} {
                        display: block;
                        position: absolute;
                        background-color: ${this.property.background_color};
                    }`);
            }else{
                this.funcs.addStyle(`
                    #${this.property.id}{
                        background-color: ${this.property.background_color};
                    }`);
            };
        };

        this.funcs.setAspect=()=>{
            if(this.set.aspect==undefined && this.property.resize_type!==null){
                this.property.aspect=[
                    this.element.par_element.offsetWidth,
                    this.element.par_element.offsetHeight
                ];
            }else if(this.property.resize_type!==null){
                this.property.aspect=this.set.aspect;
            }else if(this.set.aspect!==undefined){
                this.property.aspect=this.set.aspect;
            }else{return false;};
        };

        this.funcs.setOffsetSize=()=>{
            if(this.property.resize_type!==null){
                this.property.offset_width=Math.floor(Math.min(this.element.par_element.offsetWidth, this.element.par_element.offsetHeight*this.property.aspect[0]/this.property.aspect[1]));
                this.property.offset_height=Math.floor(this.property.offset_width*this.property.aspect[1]/this.property.aspect[0]);
                this.element.canvas.style.width=`${this.property.offset_width}px`;
                this.element.canvas.style.height=`${this.property.offset_height}px`;
            };
        };

        /* これらの関数は this.funcs.setAspect 関数によってアスペクト比が設定された後に実行する */
        this.funcs.setAttribute=()=>{
            if(this.property.resize_type!==null){
                /* convertedAreaSize の略 */
                const CAS=[
                    this.element.par_element.offsetWidth * this.property.quality_rate,
                    this.element.par_element.offsetHeight * this.property.quality_rate
                ];
                this.element.canvas.width=Math.floor(Math.min(CAS[0], CAS[1] * this.property.aspect[0] / this.property.aspect[1]));
                this.element.canvas.height=Math.floor(this.element.canvas.width * this.property.aspect[1] / this.property.aspect[0]);
            };
        };

        this.funcs.setDrawArea=()=>{
            if(this.set.drawAreaWidth!==undefined){
                this.property.draw_area_width=this.set.drawAreaWidth;
                this.property.draw_area_height=this.property.draw_area_width*this.property.aspect[1]/this.property.aspect[0];
            }else if(this.set.drawAreaHeight!==undefined){
                this.property.draw_area_height=this.set.drawAreaHeight;
                this.property.draw_area_width=this.property.draw_area_height*this.property.aspect[0]/this.property.aspect[1];
            }else{
                this.property.draw_area_height=null;
                this.property.draw_area_width=null;
            };
        };

        this.funcs.setRate=()=>{
            if(this.property.draw_area_width!==null && this.property.draw_area_height!==null){
                this.property.rate.width=this.element.canvas.width/this.property.draw_area_width;
                this.property.rate.height=this.element.canvas.height/this.property.draw_area_height;
            }else{
                this.property.rate.width=1;
                this.property.rate.height=1;
            };
        };

        this.funcs.setResizingFunction=()=>{
            this.funcs.resizing.push(()=>{this.funcs.setAspect();});
            this.funcs.resizing.push(()=>{this.funcs.setOffsetSize();});
            this.funcs.resizing.push(()=>{this.funcs.setAttribute();});
            this.funcs.resizing.push(()=>{this.funcs.setDrawArea();});
            this.funcs.resizing.push(()=>{this.funcs.setRate();});

            window.addEventListener("resize",()=>{this.funcs.resize();},false);
        };

        this.funcs.resize=()=>{
            for(let i=0;i<this.funcs.resizing.length;i++){
                this.funcs.resizing[i]();
            };
        };



        /* ユーリティー関数 */
        this.funcs.addStyle=(inner_text)=>{
            let styleSheet=document.createElement("style");
            styleSheet.innerText=inner_text;
            document.head.appendChild(styleSheet);
        };

    };







    /* 描画関数の定義 */
    set fillStyle(color){ this.element.context.fillStyle=color; };
    set strokeStyle(color){ this.element.context.strokeStyle=color; };
    set globalAlpha(num){ this.element.context.globalAlpha=num; };

    set lineWidth(num){ this.element.context.lineWidth=num * this.property.rate.width; };
    set lineCap(str){ this.element.context.lineCap=str; };
    set lineJoin(str){ this.element.context.lineJoin=str; };
    set miterLimit(num){ this.element.context.miterLimit=num * this.property.rate.width; };

    set font(str){
        const g=this.element.context; g.font=str;
        const pixel=g.font.split(/\s/)[0].slice(0, -2);
        const name=g.font.split(/\s/)[1];
        g.font=`${ pixel * this.property.rate.width }px ${ name }`;
    };
    set smooth(bool){ this.element.context.imageSmoothingEnabled=bool; };
    set smoothQuality(bool){ this.element.context.imageSmoothingQuality=bool; };
    setProperty(name, obj){ for(const key in obj){ this.element[name][key]=obj[key]; }; };

    fillRect(x, y, w, h){
        const wrate=this.property.rate.width; const hrate=this.property.rate.height;
        this.element.context.fillRect(x*wrate, y*hrate, w*wrate, h*hrate);
    };
    fillRectCenter(x, y, w, h){
        const wrate=this.property.rate.width; const hrate=this.property.rate.height;
        this.element.context.fillRect((x-w/2)*wrate, (y-h/2)*hrate, w*wrate, h*hrate);
    };
    strokeRect(x, y, w, h){
        const wrate=this.property.rate.width; const hrate=this.property.rate.height;
        this.element.context.strokeRect(x*wrate, y*hrate, w*wrate, h*hrate);
    };
    strokeRectCenter(x, y, w, h){
        const wrate=this.property.rate.width; const hrate=this.property.rate.height;
        this.element.context.strokeRect((x-w/2)*wrate, (y-h/2)*hrate, w*wrate, h*hrate);
    };
    clearRect(x, y, w, h){
        const wrate=this.property.rate.width; const hrate=this.property.rate.height;
        this.element.context.setTransform(1, 0, 0, 1, 0, 0);
        this.element.context.strokeRect(x*wrate, y*hrate, w*wrate, h*hrate);
    };
    fillAll(color){
        const c=this.element.canvas; const g=this.element.context;
        this.element.context.setTransform(1, 0, 0, 1, 0, 0);
        if(color==undefined){ g.fillRect(0, 0, c.width, c.height); }
        else{ g.fillStyle=color; g.fillRect(0, 0, c.width, c.height); };
    };
    clearAll(){
        const c=this.element.canvas;
        this.element.context.setTransform(1, 0, 0, 1, 0, 0);
        this.element.context.clearRect(0, 0, c.width, c.height);
    };
    fillArc(x, y, r, start=0, end=1){
        const g=this.element.context;
        const wrate=this.property.rate.width; const hrate=this.property.rate.height;
        g.beginPath(); g.arc(x*wrate, y*hrate, r*wrate, Math.PI*2*start, Math.PI*2*end, false);
        g.closePath(); g.fill();
    };
    strokeArc(x, y, r, start=0, end=1){
        const g=this.element.context;
        const wrate=this.property.rate.width; const hrate=this.property.rate.height;
        g.beginPath(); g.arc(x*wrate, y*hrate, r*wrate, Math.PI*2*start, Math.PI*2*end, false);
        g.closePath(); g.stroke();
    };
    fillPath(points){
        if(points.length<3){ console.error(`length of points is short.`); return `fail...`; }
        else{
            const g=this.element.context;
            const wrate=this.property.rate.width; const hrate=this.property.rate.height;
            g.beginPath(); g.moveTo(points[0][0]*wrate, points[0][1]*hrate);
            for(let i=1;i<points.length;i++){ g.lineTo(points[i][0]*wrate, points[i][1]*hrate); };
            g.closePath(); g.fill();
        };
    };
    strokePath(points, bool){
        if(points.length<2){ console.error(`length of points is short.`); return `fail...`; }
        else{
            const g=this.element.context;
            const wrate=this.property.rate.width; const hrate=this.property.rate.height;
            g.beginPath(); g.moveTo(points[0][0]*wrate, points[0][1]*hrate);
            for(let i=1;i<points.length;i++){ g.lineTo(points[i][0]*wrate, points[i][1]*hrate); };
            if(bool==true){ g.closePath(); };
            g.stroke();
        };
    };




    /* スプライトに関する記述 ( ほぼ旧 "butterJS" のコピペ ) */
    getSpriteModule(set/*←オブジェクト*/){
        const g=this.element.context;
        let module={
            img: set.img,   /*画像 の src ではなく object や tag の img*/
            sx: set.sx, sy: set.sy, sw: set.sw, sh: set.sh,
        };

        module.draw=(x, y, w, h)=>{
            const wrate=this.property.rate.width; const hrate=this.property.rate.height;
            g.drawImage( module.img, module.sx, module.sy, module.sw, module.sh,
                                x*wrate, y*hrate, w*wrate, h*hrate);
        };

        module.drawCenter=(x, y, w, h)=>{
            const wrate=this.property.rate.width; const hrate=this.property.rate.height;
            g.translate((x-w/2)*wrate, (y-h/2)*hrate);
            module.draw(0, 0, width, height);
            g.translate(-(x-w/2)*wrate, -(y-h/2)*hrate);
        };

        return module;
    };
    getTextureImageData(set){
        const g=this.element.context;
        let dataObject=set.dataObject;
        let result=g.createImageData(dataObject.width, dataObject.height);
        let canvas=document.createElement("canvas");
        let context=canvas.getContext("2d");
        result.data=dataObject.data;
        canvas.width=dataObject.width;
        canvas.height=dataObject.height;
        context.imageSmoothingEnabled=false;
        context.putImageData(result, 0, 0);
        let module={
            width: dataObject.width, height: dataObject.height,
            canvas: canvas, context: context,
        };

        module.draw=(sx, sy, sw, sh, x, y, w, h)=>{
            const wrate=this.property.rate.width; const hrate=this.property.rate.height;
            g.drawImage( canvas, sx, sy, sw, sh,
                                x*wrate, y*hrate, w*wrate, h*hrate);
        };

        module.drawCenter=(sx, sy, sw, sh, x, y, w, h)=>{
            const wrate=this.property.rate.width; const hrate=this.property.rate.height;
            g.translate((x-w/2)*wrate, (y-h/2)*hrate);
            module.draw(sx, sy, sw, sh, 0, 0, width, height);
            g.translate(-(x-w/2)*wrate, -(y-h/2)*hrate);
        };

        return module;
    };
    getSpriteImageData(set){
        let module={
            texture: set.texture,
            sx: set.sx, sy: set.sy, sw: set.sw, sh: set.sh,
        };

        module.draw=(x, y, w, h)=>{
            module.texture.draw(set.sx, set.sy, set.sw, set.sh, x, y, w, h);
        };

        module.drawCenter=(x, y, w, h)=>{
            module.texture.drawCenter(set.sx, set.sy, set.sw, set.sh, x, y, w, h);
        };

        return module;
    };









    /* 処理系関数 translate など */
    translate(x, y){
        this.element.context.translate(x*this.property.rate.width, y*this.property.rate.height);
    };
    rotate(rad){ this.element.context.rotate(rad); };
    scale(x, y){ this.element.context.scale(x, y); };
    transReset(){ this.element.context.setTransform(1, 0, 0, 1, 0, 0); };









    /* ゲッター関数 ( getter ) ( get 記述でないところもある ) */
    getCanvas(){ return this.element.canvas; };
    getContext(){ return this.element.context; };
    getRate(){ return this.property.rate; };
    getProperty(){ return this.property; };
    getElement(){ return this.element; };
    getFuncs(){ return this.funcs; };
    getButterJS(){ return this; };








    /* イベントリスナー */
    addEventListener(name, func, bool){
        const c=this.element.canvas;
        switch(name){
            case "click":
                c.addEventListener("click", (e)=>{
                    e.preventDefault();
                    this.funcs.modifyClick(e, func);
                }, bool);
                break;

            case "touchstart":
                c.addEventListener("touchstart", (e)=>{
                    e.preventDefault();
                    this.funcs.modifyTouch(e, func);
                }, bool);
                break;

            
            case "touchmove":
                c.addEventListener("touchmove", (e)=>{
                    e.preventDefault();
                    this.funcs.modifyTouch(e, func);
                }, bool);
                break;

            case "touchend":
                c.addEventListener("touchend", (e)=>{
                    e.preventDefault();
                    this.funcs.modifyTouch(e, func);
                }, bool);
                break;

            case "touchcancel":
                c.addEventListener("touchcancel", (e)=>{
                    e.preventDefault();
                    this.funcs.modifyTouch(e, func);
                }, bool);
                break;
        };
    };

    eventFunctionHeader(){
        this.funcs.modifyClick=(e, func)=>{
            let result={};
            for(const key in e){result[key]=e[key];};
            this.funcs.setOffset(result);
            func(result);
        };

        this.funcs.modifyTouch=(e, func)=>{
            let result={};
            for(const key in e){result[key]=e[key];};
            this.funcs.setOffset(result.touches);
            this.funcs.setOffset(result.changedTouches);
            this.funcs.setOffset(result.targetTouches);
            func(result);
        };

        this.funcs.setOffset=(objList)=>{
            const offset=this.element.canvas.getBoundingClientRect();
            const pageBasedWrate=this.property.draw_area_width/this.property.offset_width;
            const pageBasedHrate=this.property.draw_area_height/this.property.offset_height;
            for(let i=0;i<objList.length;i++){
                objList[i].offsetX=(objList[i].pageX-offset.left)*pageBasedWrate;
                objList[i].offsetY=(objList[i].pageY-offset.top)*pageBasedHrate;
            };
        };
    };
};
