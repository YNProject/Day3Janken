//jQuery構文 HTMLドキュメントの読み込みが完了したらこの中の処理を実行する
$(document).ready(function () {
const choices = ['グー', 'チョキ', 'パー'];   // プレイヤーとCPUが選べる手の一覧を配列に
  let userWins = 0;//プレイヤーとコンピューターの勝利数を記録する変数。 初期値はどちらも 0 に設定され、勝敗が決まるたびに加算。
  let computerWins = 0;
  let winTarget = 3;//勝利条件の初期値、この数で勝利になる
  let selectedMode = 'normal';//ゲームモード初期値normalとdouble

  //ここは両手じゃんけん用の手のための変数
  let rightHand = null;
  let leftHand = null;
  let computerRight = null;
  let computerLeft = null;
  let lastResult = '';//直前の勝敗結果の記録するための変数

  //ここまでゲームの基本状態を管理するための設定類
  //------------------------------------------------------//

　//ここは選んだ手と画像の紐付けをしている
  function convertToFileName(choice) {
    if (choice === 'グー') return 'gu';
    if (choice === 'チョキ') return 'cho';
    if (choice === 'パー') return 'pa';
    return 'def';
  }

  //プレイヤーとCPUの手を受け取り画像を更新する関数を定義
  function updateHandImages(userChoice, computerChoice) {
    $('#playerHandImage').attr('src', `img/te/${convertToFileName(userChoice)}.png`).show();
    $('#cpuHandImage').attr('src', `img/te/${convertToFileName(computerChoice)}.png`).show();
  }
  //attrはattributeの略、ここでは画像のパスを指定。
  //HTMLタグについているsrc,href,alt,id,classなどを属性という
  //.showで画像を表示状態にする

  //ダブルじゃんけんで選ばれた手を受け取り、プレイヤーとCPUの手の画像を更新する関数を定義する宣言
  //userHandはプレイヤーが選んだ手
  function updateDoubleHandImages(userHand, computerHand) {
    $('#playerHandImage').attr('src', `img/te/${convertToFileName(userHand)}.png`).show();
    $('#cpuHandImage').attr('src', `img/te/${convertToFileName(computerHand)}.png`).show();
  }
  // 手をファイル名に変換し、画像ファイルを指定

  //勝負後に手を消す処理の関数を定義
  function clearHandImages() {
    $('#playerHandImage, #cpuHandImage').hide().attr('src', '');
  }
  //プレイヤーCPU両方の<img>要素を同時に取得

  //★★★霊夢と魔理沙の表情状態を勝敗の進行に応じて切り替える
  //キャラクター画像を現在の勝敗に応じて切り替える関数を定義します
  function updatePlayerImage() {
    let imageName = 'def'; 
    //画像ファイルの変数imageNameを'def（デフォルト）'に設定
    // //条件に当たらない場合デフォルトになる
    
    const oneAwayUser = userWins === winTarget - 1;
    const oneAwayComp = computerWins === winTarget - 1;
    //あと一勝で勝利かどうかの状態判定

    const userWon = userWins >= winTarget;
    const compWon = computerWins >= winTarget;
    //勝利条件に達したかどうかの状態判定

    //結果の分岐を書いている
    if (userWon) imageName = 'totalwin'; //プレイヤーが勝利条件に達した場合totalwinに
    else if (compWon) imageName = 'totallose'; //CPUが勝利条件に達したらtotallose
    else if (oneAwayUser && oneAwayComp) imageName = 'dreach'; //両者あと1勝の場合dreach(ダブルリーチ)
    else if (oneAwayUser) imageName = 'reach';//プレイヤーのリーチ状態
    else if (oneAwayComp) imageName = 'oreach';//cpuのリーチ
    else if (lastResult === '勝ち') imageName = 'win';//個々の勝敗（直前の勝負）
    else if (lastResult === '負け') imageName = 'lose';//個々の勝敗（直前の勝負）

    $('#playerImage').attr('src', `img/reimu/${imageName}.png`);
  } //最終的にあてはまる条件で画像を切り替える

  //cpu側もプレイヤーと同じ理屈
  function updateCpuImage() {
    let imageName = 'def';
    const oneAwayUser = userWins === winTarget - 1;
    const oneAwayComp = computerWins === winTarget - 1;
    const userWon = userWins >= winTarget;
    const compWon = computerWins >= winTarget;

    if (compWon) imageName = 'totalwin';
    else if (userWon) imageName = 'totallose';
    else if (oneAwayUser && oneAwayComp) imageName = 'dreach';
    else if (oneAwayComp) imageName = 'reach';
    else if (oneAwayUser) imageName = 'oreach';
    else if (lastResult === '負け') imageName = 'win';
    else if (lastResult === '勝ち') imageName = 'lose';

    $('#cpuImage').attr('src', `img/marisa/${imageName}.png`);
  }

  //通常のじゃんけんモードのゲームをリセットして初期状態にする関数を定義
  function resetGame() {
    userWins = 0; //勝敗などを初期値に
    computerWins = 0;
    lastResult = '';
    $('#chant').text(''); //掛け声などを空に
    $('#result').text('');
    $('#score').text('あなた：0　コンピューター：0'); //スコアを0に
    $('#buttons button').prop('disabled', true); //じゃんけんボタンを押せないように非活性に
    $('#gameArea').show(); //通常じゃんけんのゲームエリア表示
    updatePlayerImage();
    updateCpuImage(); //プレイヤーとCPUの画像を初期化
    clearHandImages(); //手の画像消去、次の勝負に備える状態
  }


  //両手じゃんけんのラウンドをリセットするための処理
  //両手じゃんけんのゲームをリセットし次の勝負に備えて初期状態に戻す関数を定義
  function resetDoubleGame() {
    $('#chantDouble').text(''); //掛け声を空に
    $('#doubleResult').text('');
    $('#pullChoice').hide(); //どちらの手を引くかボタンを非表示に
    $('#pullChoice button').prop('disabled', false).removeClass('selected');//引く手ボタンの有効化
    $('#doubleArea button[data-hand]').prop('disabled', false).removeClass('selected');//右手左手の選ぶボタンの有効化
    $('.compRight, .compLeft').removeClass('selected').text(function () {
      return $(this).data('choice');//コンピューターの右手左手表示をリセット
    });
    rightHand = null; //プレイヤーとCPUの右手左手の選択をすべてnullに戻します
    leftHand = null; 

    computerRight = null;
    computerLeft = null;

    $('#score').text(`あなた：${userWins} コンピューター：${computerWins}`); //スコアを更新する
    updatePlayerImage(); //現在の勝敗状況に応じて更新
    updateCpuImage();
    clearHandImages(); //手の画像の消去
  }

  //通常じゃんけんラウンド開始前の掛け声演出
  //通常じゃんけんのラウンド開始前に掛け声を表示してボタン操作を制御する関数を定義する宣言
  function startChantBeforeEachRound() {
    $('#buttons button').prop('disabled', true);//じゃんけんボタンを一時的に無効化
    $('#chant').text('最初はグー…');//最初はグーを表示
    $('#result').text('');//前ラウンドの結果をクリアする

    //０.８秒後に掛け声をじゃんけんに切り替える（少し間を置くため）
    setTimeout(() => {
      $('#chant').text('じゃんけん…');
      //さらに０．８秒後に掛け声を消去し、じゃんけんボタンを有効化、掛け声が終わったら手を選べるように
      setTimeout(() => {
        $('#chant').text('');
        $('#buttons button').prop('disabled', false);
      }, 800);
    }, 800);
  }

  //通常じゃんけんのラウンドを開始する準備を行う関数
  function beginRound() {
    clearHandImages();//手画像を消去
    startChantBeforeEachRound();//掛け声を開始
  }

//両手じゃんけんのラウンドを開始する準備を行う関数
  function startDoubleJanken() {
    $('#chantDouble').text('じゃんけんぽいぽい…');//掛け声表示
    $('#doubleResult').text('');//前ラウンドの結果を消去
    $('#pullChoice').hide();//どちらの手を引くかボタンの非表示
    $('#score').text(`あなた：${userWins} コンピューター：${computerWins}`);//現在のスコアを表示
  }

  //両手じゃんけんでどちらの手を引いたかを基準にプレイヤーとCPUの手を決定し、通常のじゃんけんルールで勝敗決定する処理
  function judgeDoubleJanken(pullHand) {
    const userHand = pullHand === 'right' ? leftHand : rightHand;
    const computerHand = pullHand === 'right' ? computerLeft : computerRight;
    //勝負に使う手を決定する

    let result = ''; //結果の初期化

    //じゃんけん判定
    if (userHand === computerHand) {
      result = 'あいこ';
    } else if (
      (userHand === 'グー' && computerHand === 'チョキ') ||
      (userHand === 'チョキ' && computerHand === 'パー') ||
      (userHand === 'パー' && computerHand === 'グー')
    ) {
      result = '勝ち';
      userWins++; //userWinsを1増やす
    } else {
      result = '負け';
      computerWins++;
    }

    lastResult = result;//直前の勝敗結果を記録する
    updatePlayerImage();//画像を切り替える
    updateCpuImage();
    updateDoubleHandImages(userHand, computerHand);//選んだ手の表示

    $('#chantDouble').html(
      `こっちひくの…<br><br><span class="resultText">${result}</span>`
    );

    $('#doubleResult').text('');
    $('#score').text(`あなた：${userWins} コンピューター：${computerWins}`);
    //スコアの表示更新

    //勝利条件に到達したかどうかを判定する
    if (userWins >= winTarget || computerWins >= winTarget) {
      const winner = userWins >= winTarget ? 'あなたの勝利！🎉' : 'コンピューターの勝利…😢';
      //勝者を決定する処理
      $('#chantDouble').append(`<br>${winner}`);//勝者メッセージ追加
      $('#doubleArea button[data-hand]').prop('disabled', true);
      $('#pullChoice button').prop('disabled', true);
      // 最後の勝負では手を残すため、clearHandImages() は呼ばない
      //ゲーム終了後は操作できないようにするということ

      //まだ勝敗条件に達していない場合の処理
    } else {
      setTimeout(() => {
        clearHandImages(); // 次の勝負の前に消す
        resetDoubleGame();
        startDoubleJanken();
      }, 2000);//２秒後に手画像消去、両手じゃんけんの状態リセット、新しいラウンドを開始
    }
  }

  //ゲーム開始ボタンのクリックイベント
  //選択されたゲームモードを取得
  //勝利条件（勝利回数）を入力値から設定
  $('#startGame').on('click', function () {
    selectedMode = $('#gameMode').val();
    const inputVal = parseInt($('#winTarget').val(), 10);
    winTarget = isNaN(inputVal) ? 3 : inputVal;//デフォルト値は３

    //ゲーム開始後に開始ボタン、勝利数入力、モード選択を無効化
    $('#startGame').prop('disabled', true);
    $('#winTarget').prop('disabled', true);
    $('#gameMode').prop('disabled', true);

    //通常じゃんけんモードが選ばれた場合の処理
    if (selectedMode === 'normal') {
      resetGame();//ゲームをリセット
      $('#doubleArea').hide();//両手じゃんけんエリアを非表示
      beginRound();//通常じゃんけんのラウンド開始

      //両手じゃんけんが選ばれた場合の処理
    } else if (selectedMode === 'double') {
      userWins = 0;//勝敗をリセット
      computerWins = 0;
      $('#score').text('あなた：0　コンピューター：0');//スコア表示をリセット
      $('#gameArea').hide();//通常じゃんけんエリアを非表示
      $('#doubleArea').show();//両手じゃんけんエリアを表示
      resetDoubleGame();//両手じゃんけんをリセット
      startDoubleJanken();//両手じゃんけん開始
    } else {
      alert('このモードはまだ準備中です！');
    }//そのほかのモードが選ばれた場合のメッセージ
  });

  //通常じゃんけんボタンの処理
  $('#buttons button').on('click', function () {
    if (selectedMode !== 'normal') return;//通常モードではない場合、処理を終了する

    //プレイヤーが選んだ手をuserChoiceに代入する
    const userChoice = $(this).data('choice');
    const computerChoice = choices[Math.floor(Math.random() * 3)];
    //コンピューターの手をランダムに選ぶ

    $('#chant').text('ポン！');//掛け声エリアに表示

    let result = '';//勝敗結果変数を初期化
 
    //じゃんけんの判定をするところ
    if (userChoice === computerChoice) {
      result = 'あいこ';
    } else if (
      (userChoice === 'グー' && computerChoice === 'チョキ') ||
      (userChoice === 'チョキ' && computerChoice === 'パー') ||
      (userChoice === 'パー' && computerChoice === 'グー')
    ) {
      result = '勝ち';
      userWins++;
    } else {
      result = '負け';
      computerWins++;
    }

    lastResult = result; //勝敗結果をlastResultに記録
    updatePlayerImage(); //キャラ画像更新
    updateCpuImage(); //キャラ画像更新
    updateHandImages(userChoice, computerChoice);//選んだ手の表示

    $('#chant').html(`<span class="resultText">${result}</span>`);
    $('#score').text(`あなた：${userWins} コンピューター：${computerWins}`);
    //掛け声表示エリアに結果を強調表示
    //スコアを最新の勝敗数に更新

    //勝利条件に達した場合の処理
    if (userWins >= winTarget || computerWins >= winTarget) {
      const winner = userWins >= winTarget ? 'あなたの勝利！🎉' : 'コンピューターの勝利…😢';
      $('#chant').append(`\n${winner}`);
      $('#buttons button').prop('disabled', true);//ボタンの無効化
      // 最後の勝負では手を残すため、clearHandImages() は呼ばない
    } else {//まだ勝敗条件に達していない場合の処理
      setTimeout(() => {
        clearHandImages(); // 次の勝負の前に消す
        beginRound();
      }, 2000);
    }
  });

  //両手モードの手選択処理
  //右手、左手ボタンがクリックされたときの処理を定義
  $('#doubleArea button[data-hand]').on('click', function () {
  
    //クリックされたボタンから右手か左手か、選んだ手の種類を取得
    const hand = $(this).data('hand');
    const choice = $(this).data('choice');

    //見た目でこの手を選んだということがわかるように
    $(`#doubleArea button[data-hand="${hand}"]`).removeClass('selected');
    $(this).addClass('selected');

    //一度選んだ手は変更できなくしている
    //右手を選んだら記録して右手ボタンを無効化
    //左手を選んだら記録して左手ボタンを無効化
    if (hand === 'right') {
      rightHand = choice;
      $(`#doubleArea button[data-hand="right"]`).prop('disabled', true);
    } else {
      leftHand = choice;
      $(`#doubleArea button[data-hand="left"]`).prop('disabled', true);
    }

    //プレイヤーが両手を選び終えたらコンピューターの手を決定する
    if (rightHand && leftHand) {
      computerRight = choices[Math.floor(Math.random() * 3)];
      computerLeft = choices[Math.floor(Math.random() * 3)];

      //コンピューターの右手表示をリセットし、ランダムに選ばれた手を「選択状態」にします。
      $('.compRight').text(function () {
        return $(this).data('choice');
      }).removeClass('selected');
      $(`.compRight[data-choice="${computerRight}"]`).addClass('selected');

      //同左手
      $('.compLeft').text(function () {
        return $(this).data('choice');
      }).removeClass('selected');
      $(`.compLeft[data-choice="${computerLeft}"]`).addClass('selected');

      //掛け声表示
      //引く手ボタンを有効化
      $('#chantDouble').text('どっちひくの？');
      $('#pullChoice').show();
      $('#pullChoice button').prop('disabled', false);
    }
  });

  //引く手選択処理
  $('#pullChoice button').on('click', function () {
    $('#pullChoice button').removeClass('selected');
    $(this).addClass('selected');

    //クリックしたボタンから右を引くか左を引くかpullHandを取得します
    const pullHand = $(this).data('pull');
    //引く手ボタンを無効化
    $('#pullChoice button').prop('disabled', true);
  
    //実際に勝敗判定を行う関数judgeDoubleJankenを呼び出します
    judgeDoubleJanken(pullHand);
  });

  //リセット処理　通常じゃんけん、両手じゃんけん共通
  $('#resetGame, #resetGameDouble').on('click', function () {
    //ゲーム開始ボタン、勝利数入力、モード選択の有効化
    $('#startGame').prop('disabled', false);
    $('#winTarget').val('').prop('disabled', false);
    $('#gameMode').prop('disabled', false);
    //ゲームエリアの非表示
    $('#gameArea').hide();
    $('#doubleArea').hide();
    //掛け声や結果表示をすべて消去
    $('#chant').text('');
    $('#chantDouble').text('');
    $('#result').text('');
    $('#doubleResult').text('');
    //スコアの初期化
    $('#score').text('あなた：0　コンピューター：0');
    //勝敗数と直前の結果をリセット
    userWins = 0;
    computerWins = 0;
    lastResult = '';
    //画像を初期化、手は消去
    updatePlayerImage();
    updateCpuImage();
    clearHandImages();
  });
});
