"use strict";

/* NPPA.js ( Number Place Processing Algorithm ) について */

console.log(`NPPA.js is loaded.`);

/**
 * *** プログラムの最適化がまだできていません. ***
 * ●NPPA クラスに渡される引数について.
 * (1) _set オブジェクト
 *     {
 *         board:[],
 *             ...数独の盤面を表す一次元配列. 0~80 のインデックスで要素数が 81 である.
 *             ... 1~9 をもとから埋まった数(問題から与えられるヒント)とし, 0が問題の空白を表す.
 *         limit:( number ),
 *             ...ある時間を超えた場合処理を終了することができるようにするための数.
 *             ...処理を始めてからこの時間を超えてまだ成功していなければ処理を終了する.
 *             ...この値が undefined もしくは false もしくは null である場合, 制限時間は設けないようにする.
 *         success:(obj)=>{ 処理 },
 *             ...処理が成功して(ある一つ解が求まって)終了したときに呼び出す関数.
 *             ...処理が再帰関数であり, 処理の流れが複数発生するため success 関数は複数回呼び出される可能性があるため要注意.
 *             ...引数にはオブジェクトを渡す.
 *             ...引数のオブジェクト
 *                 {
 *                     board:[],
 *                         ...完成した盤面. _set オブジェクトの board と同じ形式なので要参照.
 *                     before:[],
 *                         ...処理前の問題の時点での盤面. _set オブジェクトで受け取った board をコピーする.
 *                     changed:[],
 *                         ...完成した盤面から処理前の盤面で埋まっている所を0で置き換えた盤面.
 *                         ...差分. 新たに埋めたところを示す盤面.
 *                     time:( number ),
 *                         ...処理開始から処理終了までかかった時間
 *                         ...単位はミリ秒
 *                 }
 *     }
 */

class NPPA{
  constructor(_set){
    this.set=_set;
    this.property={
      /* まだ決定していない値は原則 null にしている */
      limited:null,  /* 制限時間があるかどうか true or false */
      board:null,    /* 処理をするフィールド. 現在操作している盤面. */
      startTime:null,
    };

    /* 処理開始 */
    this.init();
  };

  /* 処理開始関数 */
  init(){
    /* 引数が正しいかある程度チェックする. 正しくなければ処理を中断する. */
    if(!(this.argumentCheck())){ console.error(`Argument is not suit.`); return; };

    /* 制限時間を設けるかの判定 */
    this.property.limited=false;
    if(isNaN(this.set.limit)){ this.property.limited=true; };

    /* 引数の盤面をコピー(第一階層下がるシャローコピー(実質ディープコピー)) */
    this.property.board=[...this.set.board];

    /* 処理のスタート時間を記録 */
    this.property.startTime=performance.now();

    /* マスを全て埋め終えるまでループ(再起関数なので何度も呼び出される) */
    this.loop(this.property.board);
  };

  /* 成功時に実行 */
  success(){
    const board=[...this.property.board];
    const before=[...this.set.board];
    const changed=[];
    /* 変化した部分だけを移す関数 */
    for(let i=0;i<81;i++){
      if(before[i]===0){
        changed.push(board[i]);
      }else{
        changed.push(0);
      };
    };
    /* 成功時関数呼び出し */
    this.set.success({
      board: [...this.property.board], before: [...this.set.board],
      changed: [...changed],
      time: performance.now()-this.property.startTime,
    });
  };

  /* 引数が正しいかある程度チェックする */
  argumentCheck(){
    const flag=[
      this.set.board.length===81,
      this.set.success!==undefined,
      this.checkBoard(this.set.board),
      this.checkProb(this.getProb(this.set.board))
    ];
    /* flag が全て true であればいいのでそれを検証 */
    for(let i=0;i<flag.length;i++){
      /* 一つでも引っかかれば false */
      if(flag[i]===false){ return false; };
    };
    return true;
  };

  /* 盤面のそれぞれの要素をカウントする関数 */
  elementCount(_board){
    /* ボードをコピー */
    const board=[..._board];
    /* カウントする配列. 0番目は空白をカウントする. */
    const counter=[0,0,0,0,0,0,0,0,0,0];
    /* 先頭の要素のインデックスのcounterの要素を +1 する.
       ⇒ 先頭を削除する. 
      この操作を 81 回行う. */
    for(let i=0;i<81;i++){
      counter[board[0]]++;
      board.shift();
    };
    return counter;
  };

  /* 再帰関数となっている. */
  loop(_board){
    let board=[..._board];
    /* 可能性を見ただけで確実に埋められるマスを全て埋める. */
    board=this.obviousUpdate(board);
    /* 盤面に矛盾がないか調べる */
    if(!(this.checkBoard(board))){ return; };
    /* 制限時間を過ぎているか判定 */
    if(!(this.checkTimeOut())){ return; };
    /* マスがすべて埋まっているか判定 */
    if(this.elementCount(board)[0]===0){
      this.property.board=[...board];
      this.success();
      return;
    };
    /* マスの可能性を全て書き出した配列を得る */
    const prob=this.getProb(board);
    if(!(this.checkProb(prob))){ return; };

    /* これ以前の処理でマスが埋まらなかったときの処理(重要) */
    const index=this.leastProbLengthIndex(prob);
    const probIndex=this.probTrueIndex(prob[index]);
    for(let i=0;i<probIndex.length;i++){
      const tryBoard=[...board];
      tryBoard[index]=probIndex[i];
      this.loop(tryBoard);
    };
  };

  /* 可能性を見ただけで確実に埋められるマスを全て埋める. */
  obviousUpdate(_board){
    const board=[..._board];

    const loop=()=>{
      /* マスの可能性を全て書き出した配列を得る */
      const prob=this.getProb(board);
      /* 第一関門の操作を行う */
      const _1=this.lookProbAndQuick(prob);
      /* 第二関門の操作を行う */
      const _2=this.lookAndQuick(prob);

      if(_1!==false){ board[_1[0]]=_1[1]; loop(); return; };
      if(_2!==false){ board[_2[0]]=_2[1]; loop(); return; };
    };

    loop();
    return board;
  };

  /* 制限時間を過ぎているか判定 */
  checkTimeOut(){
    /* 時間制限そのものが有効かどうか判定 */
    if(this.property.limited){
      /* 処理に要している時間(現在の時間-スタートした時間)が制限時間を超えているかどうか判定 */
      if(performance.now()-this.property.startTime > this.set.limit){ return false; };
    };
    return true;
  };

  /* 盤面に矛盾(ルール上適当でない)があるかどうか調べる. */
  checkBoard(_board){
    const board=[..._board];
    const temp=[0, 3, 6, 27, 30, 33, 54, 57, 60];
    const checkArr=[];
    for(let i=0;i<9;i++){ checkArr.push(this.getLineIndex(i*9)); };
    for(let i=0;i<9;i++){ checkArr.push(this.getRowIndex(i)); };
    for(let i=0;i<9;i++){ checkArr.push(this.getBlockIndex(temp[i])); };
    for(let i=0;i<checkArr.length;i++){
      const count=[0,0,0,0,0,0,0,0,0,0];
      for(let j=0;j<checkArr[i].length;j++){ count[board[checkArr[i][j]]]++; };
      for(let j=1;j<count.length;j++){ if(count[j]>=2){ return false; }; };
    };
    return true;
  };

  /* 可能性が一つしかないマスを埋める. 埋められるマスがあれば配列 [(変更する盤面のインデックス),(変更後の値)] を返し,
     埋められるマスがなければ false を返す. */
  lookProbAndQuick(_prob){
    const prob=JSON.parse(JSON.stringify(_prob));
    for(let i=0;i<81;i++){
      if(prob[i].length!==0){
        let trueCount=0;
        for(let j=0;j<prob[i].length;j++){ if(prob[i][j]){ trueCount++; }; };
        if(trueCount===1){
          return [i, prob[i].indexOf(true)];
        };
      };
    };
    return false;
  };

  /* 縦と横と9マスごとのかたまりだけを見て確実に埋められるマスのインデックスと埋められる値を返す関数
     行: line, 列: row, かたまり:block */
  lookAndQuick(_prob){
    const prob=JSON.parse(JSON.stringify(_prob));
    for(let i=0;i<81;i++){
      if(prob[i].length!==0){
        /* その数が含まれる行のインデックスを取得する */
        /* その数が含まれる列のインデックスを取得する */
        /* その数が含まれるブロックのインデックスを取得する */
        const line=this.getLineIndex(i);
        const row=this.getRowIndex(i);
        const block=this.getBlockIndex(i);

        /* 可能性のあるナンバーをprobのインデックスから取得する */
        const use=[];
        for(let j=0;j<prob[i].length;j++){
          if(prob[i][j]){ use.push(j); };
        };

        /* その数が含まれている行でその数の可能性とかぶっているか判定する. かぶっていなかったら即確定. */
        for(let j=0;j<use.length;j++){
          const n=use[j];
          const trueCount={
            line:0, row:0, block:0,
          };
          for(let k=0;k<9;k++){
            if(prob[line[k]][n]){ trueCount.line++; };
            if(prob[row[k]][n]){ trueCount.row++; };
            if(prob[block[k]][n]){ trueCount.block++; };
          };
          if(trueCount.line===0 || trueCount.row===0 || trueCount.block===0){
            return [i, n];
          };
        };
      };
    };
    return false;
  };

  /* 入れれるマスの可能性を全て書き出した配列を返す関数
     すでに埋まっているマス => [] とする. */
  getProb(_board){
    const board=[..._board];
    const result=[];
    for(let i=0;i<81;i++){
      /* ボードが既に埋まっていたら可能性を議論する必要はないので可能性のところに長さ0の配列 [] を入れる. */
      if(board[i]!==0){
        result[i]=[];
      }else{
        result[i]=[false];
        while(result[i].length<10){ result[i].push(true); };
        /* その数が含まれる行のインデックスを取得する */
        /* その数が含まれる列のインデックスを取得する */
        /* その数が含まれるブロックのインデックスを取得する */
        const line=this.getLineIndex(i);
        const row=this.getRowIndex(i);
        const block=this.getBlockIndex(i);
        /* その数が含まれる行・列・ブロックで同時並行で比較 */
        for(let j=0;j<9;j++){
          result[i][board[line[j]]]=false;
          result[i][board[row[j]]]=false;
          result[i][board[block[j]]]=false;
        };
      };
    };
    return result;
  };

  /* prob 配列をチェックする. false が10個連続する場合, 解が存在しない状況になっているため. */
  checkProb(_prob){
    const prob=JSON.parse(JSON.stringify(_prob));
    for(let i=0;i<prob.length;i++){
      if(prob[i].length!==0){
        if(!(prob[i].includes(true))){
          return false;
        };
      };
    };
    return true;
  };

  /* prob 配列で最も可能性(候補)の数が少ないマスのインデックスを返す. */
  leastProbLengthIndex(_prob){
    const prob=JSON.parse(JSON.stringify(_prob));
    let min=32; /* 何かしらの大きな値 */ let index=null;
    for(let i=0;i<prob.length;i++){
      if(prob[i].length!==0){
        let count=0;
        for(let j=0;j<prob[i].length;j++){ if(prob[i][j]){ count++; }; };
        if(count<min){ min=count; index=i; };
      };
    };
    return index;
  };

  /* prob の特定のマスで true になっているインデックスを返す. */
  probTrueIndex(_arr){
    const arr=[..._arr];
    const result=[];
    for(let i=0;i<arr.length;i++){ if(arr[i]){ result.push(i); }; };
    return result;
  };

  /* 同じ行のインデックスを返す. */
  getLineIndex(i){
    const result=[];
    for(let j=i-i%9;j<i-i%9+9;j++){
      result.push(j);
    };
    return result;
  };

  /* 同じ列のインデックスを返す. */
  getRowIndex(i){
    const result=[];
    for(let j=i%9;j<81;j+=9){
      result.push(j);
    };
    return result;
  };

  /* 同じブロックのインデックスを返す. */
  getBlockIndex(i){
    const result=[];
    for(let j=0;j<9;j++){
      const s=i-i%3-i%27+i%9;
      result.push(s+j%3+(j-j%3)*3);
    };
    return result;
  };

  /* いちいち入力するのがめんどくさいので標準入力を作った */
  static standard(board){
    const nppa=new NPPA({
      board: board,
      limit: 5000,    /* 5000 ms */
      success:(obj)=>{
        let result=`time: ${obj.time}\n\nboard:\n`;
        for(let i=0;i<81;i++){
          result=`${result}${obj.board[i]} `;
          if(i%9===8){
            result.trim();
            result=`${result}\n`;
          };
        };
        console.log(result);
      },
    });
  };
};

/*

盤面のナンバリング

00 01 02 03 04 05 06 07 08
09 10 11 12 13 14 15 16 17
18 19 20 21 22 23 24 25 26
27 28 29 30 31 32 33 34 35
36 37 38 39 40 41 42 43 44
45 46 47 48 49 50 51 52 53
54 55 56 57 58 59 60 61 62
63 64 65 66 67 68 69 70 71
72 73 74 75 76 77 78 79 80

*/
