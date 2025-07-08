//WINresutlsScreenのbackToTitleButtonが反応しないver---------解消
//他、正常に機能する。
//2025.01.31 perfect!
$(document).ready(function() {
    // define
    let question;
    let answer;
    let isGameOver = false;
    let generatedQuestions = [];
    let score = 0;
    let digitLevel = 1; // 一桁
    $("#selectScreen").hide();
    $("#gameDiscription").hide();
    $(".firstPage").hide();
    $(".secondPage").hide();
    $("#startButton").click(function(){
        $("#runningPerson").removeAttr("style");
        $("#obstacle").removeAttr("style");
        $("#questionScreen").hide();
        $('#result').hide();
        $("#question").text("");
        $("#answer").val("");
        $("#title").hide();
        // screen transition
        $("#selectScreen").show();
    });

    $(".faq-button").click(function() {
        $("#title").hide();
        $("#gameDiscription").show();
        $(".firstPage").show();
    });

    // 1ページ目の次へボタン
    $("#firstPageNext").click(function() {
        $(".firstPage").hide();
        $(".secondPage").show();
    });

    // タイトルへ戻るボタン
    $("#backToStartScreen").click(function() {
        $(".secondPage").hide();
        $("#gameDiscription").hide();
        $("#title").show();
    });

    
     // 一桁　二桁　三桁のボタンのクリックイベント
     $('#oneDigit').click(function() {
        console.log("One digit button clicked");
        setDigitLevel(1);
        gameStart();
    });
    
    $('#twoDigits').click(function() {
        console.log("2 digit button clicked");
        setDigitLevel(2);
        gameStart();
    });
    
    $('#threeDigits').click(function() {
        console.log("3 digit button clicked");
        setDigitLevel(3);
        gameStart();
    });

    $("#WINscrennBackToTitleButton").click(function() {
        resetGame();
        $("#WINresultScreen").hide();
        $("#title").show();
    });

    $("#LOSEscrennBackToTitleButton").click(function() {
        resetGame();
        $("#LOSEresultScreen").hide();
        $("#title").show();
    });
    

    function gameStart() {
        // 桁選択された後
        $("#selectScreen").hide();
        $("#questionScreen").show();
        $("#answer").focus();

        generateQuestion();
        runningPersonAnimation();
        generateObstacle();
        // 衝突判定
        const collisionCheckInterval = setInterval(function() {
            if (isGameOver) {
                clearInterval(collisionCheckInterval);
                return;
            }

            var personPos = $("#runningPerson").position();
            var obstaclePos = $("#obstacle").position();

            // プレイヤーと障害物の当たり判定用の矩形を定義
            const playerBounds = {
                left: personPos.left + 40, // 左側の余白を20ピクセル無視
                top: personPos.top + 40,   // 上側の余白を20ピクセル無視
                right: personPos.left + $("#runningPerson").width() - 40, // 右側の余白を20ピクセル無視
                bottom: personPos.top + $("#runningPerson").height() - 40 // 下側の余白を20ピクセル無視
            };

            const obstacleBounds = {
                left: obstaclePos.left + 30, // 左側の余白を20ピクセル無視
                top: obstaclePos.top + 30,   // 上側の余白を20ピクセル無視
                right: obstaclePos.left + $("#obstacle").width() - 30, // 右側の余白を20ピクセル無視
                bottom: obstaclePos.top + $("#obstacle").height() - 30 // 下側の余白を20ピクセル無視
            };

            // 衝突判定
            if (playerBounds.left < obstacleBounds.right && 
                playerBounds.right > obstacleBounds.left &&
                playerBounds.top < obstacleBounds.bottom &&
                playerBounds.bottom > obstacleBounds.top) {
                $("#runningPerson").stop();
                $("#obstacle").stop();
                $("#questionScreen").hide();
                $("#LOSEresultScreen").show();
                isGameOver = true;
            }
        }, 100); // 100ミリ秒ごとに衝突判定

    }

    function resetGame() {
        isGameOver = false;
        score = 0;
        generatedQuestions = [];
        digitLevel = 1;
        // 衝突判定のタイマーをクリア
        //clearInterval(collisionCheckInterval);
    }


    // 桁数設定関数
    function setDigitLevel(level) {
        digitLevel = level;
        localStorage.setItem('selectedDigit', level); // 選択状態の保存（オプション）
    }

    //setting dight
    function generateRandomNumber() {
        const min = Math.pow(10, digitLevel - 1); // 最小値 (1, 10, 100)
        const max = Math.pow(10, digitLevel) - 1; // 最大値 (9, 99, 999)
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateQuestion() {
        const num1 = generateRandomNumber();// dight
        const num2 = generateRandomNumber();//dight
        const operation = Math.floor(Math.random() * 4); // 0: 足し算, 1: 引き算, 2: かけ算, 3: 割り算
        
        switch (operation) {
            case 0: // 足し算
                question = `${num1} + ${num2} = ?`;
                answer = num1 + num2;
                break;
            case 1: // 引き算
                if (num1 < num2) {
                    question = `${num2} - ${num1} = ?`;
                    answer = num2 - num1;
                } else {
                    question = `${num1} - ${num2} = ?`;
                    answer = num1 - num2;
                }
                break;
            case 2: // かけ算
                question = `${num1} × ${num2} = ?`;
                answer = num1 * num2;
                break;
            case 3: // 割り算
                if (num1 % num2 === 0) {
                    question = `${num1} ÷ ${num2} = ?`;
                    answer = num1 / num2;
                } else if (num2 % num1 === 0) {
                    question = `${num2} ÷ ${num1} = ?`;
                    answer = num2 / num1;
                } else {
                    // 割り算で答えが整数でない場合は再度問題を生成
                    generateQuestion();
                    return;
                }
                break;
            default:
                generateQuestion();
                return;
        }
    
        if (generatedQuestions.includes(question)) {
            generateQuestion(); // 重複の場合再度生成
        } else {
            generatedQuestions.push(question);
            $("#question").text(question);
            $("#submitAnswer").off("click").on("click", function() {
                if (!isGameOver) {
                    checkAnswer(answer);
                }
            });
        }
        // Enterキーが押されたときの処理
        $("#answer").off("keydown").on("keydown", function(event) {
            if (event.key === "Enter") { 
                event.preventDefault();
                $("#submitAnswer").click();
            }
        });

    }

    ////ここ変えたら、難易度調節できるよ!!(Change here to make it easy or hard!)////
    //ranningPersonアニメーション
    function runningPersonAnimation() {
        let animationDuration; // アニメーション時間を格納する変数
    
        // digitLevel に応じてアニメーション時間を設定
        switch (digitLevel) {
            case 1: // 一桁
                animationDuration = 15000; // 15秒
                break;
            case 2: // 二桁
                animationDuration = 150000; // 150秒
                break;
            case 3: // 三桁
                animationDuration = 300000; // 300秒
                break;
            default: // デフォルト（一桁と同じ）
                animationDuration = 15000; // 15秒
                break;
        }

        // アニメーションを開始
        $("#runningPerson").animate({
            left: '+=1350px' // 1350px右に移動
        }, animationDuration, function() {
            $("#runningPerson").stop(true, true); // アニメーションを完全に停止
            $("#obstacle").stop(); // 障害物のアニメーションを停止
            $("#questionScreen").hide(); // 問題画面を非表示
            $("#WINresultScreen").show(); // 勝利画面を表示
            isGameOver = true; // ゲーム終了フラグを設定
        });
    }

    //障害物アニメーション
    function generateObstacle() {
        $("#obstacle").css("display", "block");
        const obstacleLeft = Math.min($("#runningPerson").position().left + 450, 1900); // 障害物の左端を走る人の前450pxに設定
        $("#obstacle").css("left", `${obstacleLeft}px`);
        $("#obstacle").attr("src", "./img/障害物.png");
        $("#obstacle").animate({
            top: '65%' // ↓に落下
        }, 500)
        // 障害物が1350pxより大きい位置にある場合
        if (obstacleLeft > 1350) {
            $("#runningPerson").stop(true, true); // アニメーションを完全に停止
            $("#obstacle").stop(); // 障害物のアニメーションを停止
            console.log("障害物が1350pxより大きい位置にあるため、0.5秒でゴールします。"); // デバッグ用
            $("#runningPerson").animate({
                left: '+=1500px' // 1350px右に移動
            }, 1000, function() {
                $("#runningPerson").stop(true, true);//why here should write like this?? Huh??
                $("#obstacle").stop();
                $("#questionScreen").hide();
                $("#WINresultScreen").show();
                isGameOver= true;
            });
        }
    }

    //衝突判定const collisionCheckIntervalがもともとあった場所

    // 答えをチェックする関数
    function checkAnswer(correctAnswer) {
        $('#result').show();
        let userAnswer = $("#answer").val();
        // 全角数字でも回答可能にする　全→半
        userAnswer = userAnswer.replace(/[０-９]/g, function(match) {
            return String.fromCharCode(match.charCodeAt(0) - 0xFEE0);
        });

        userAnswer = parseInt(userAnswer, 10);//cahnged str to int. 10 is 基数

        // 答えをチェック
        if (userAnswer === correctAnswer) {
            $("#result").text("正解です！").css("color", "green");
            score++;
            if (!isGameOver) {
                generateQuestion();
            }
            // 障害物を爆発する画像に変更
            $("#obstacle").attr("src", "./img/爆破.png");
            setTimeout(function() {
                $("#obstacle").hide();
                generateObstacle();
            }, 50);
        } else {
            $("#result").text("不正解です。").css("color", "red");
        }

        $("#answer").val("");
        
    }

});
