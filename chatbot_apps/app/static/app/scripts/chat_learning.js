(function () {
    //------------------//
    //LearningModeの処理//
    //------------------//

    //FIXME:ここらへんの処理はPythonでできるなら値だけJSONとかで渡したい
    //FIXME:できるだけ2次元配列処理ではなく、MapとかにしてO(1)で速さあげたい。
    //とはいえ、一行ずつループ処理するならそんなかわらないかも？

    //CSVファイルを二次元配列([data,label]の配列)に変換
    function convertCSVtoArray(str) {
        let result = []
        let row = str.split("\n");

        for (let i = 0; i < row.length; i++) {
            result[i] = tmp[i].split(';')
        }
    }

    //CSVファイルをMap([data,label]の配列)に変換
    function convertCSVtoMap(str) {
        let result = []
        let row = str.split("\n");

        for (let i = 0; i < row.length; i++) {
            result[i] = tmp[i].split(';')
        }

        let answer_data = result.map((result_set, i) => ({
            value: result[0],
            answer:result[1]
        }))
    }

    //Twitterのデータファイル読み込み
    data_file = "data.csv"
    let req = new XMLHttpRequest();
    req.open("get", data_file);
    req.send(null)

    req.onload = function () {
        let dataset = convertCSVtoArray(req.responseText);
    }

    //Answerのデータファイル読み込み
    answer_file = "answer.csv"
    let req = new XMLHttpRequest();
    req.open("get", answer_file);
    req.send(null)

    req.onload = function () {
        let answerData = convertCSVtoMap(req.responseText);
    }

    //BotUIを作成
    let botui = new BotUI('chat-app')
    var data = [] //ラベル配列用初期化

    botui.messeage.bot({
        content: "こんにちは!"
    }).then(init);

    function init() {
        //データがある限りループ
        for (let j = 1; j <= dataset.length; j++) {
            if (dataset[j][1] == null) {

                dataLabeling(dataset[j][0], j)

                botui.message.bot({
                    delay: 200,
                    content: 'まだ続けますか？'
                }).then(function () {
                    return botui.action.button({
                        delay: 200,
                        action: [{
                            icon: 'circle-thin',
                            text: 'はい',
                            value: true
                        }, {
                            icon: 'close',
                            text: 'いいえ',
                            value: false
                        }]
                    });
                }).then(function (res) {
                    if (res.value == false) {
                        for (let k = 0; k < data.length; k++) {
                            line_num = data[k][0];
                            data_file[line_num][1] = data[k][1];
                        }
                        break;
                    }
                });
            }
        }
        end()
    }

    //質問
    function dataLabeling(str,j) {
        botui.messeage.bot({
                delay: 200,
                content: str,
        }).then(function () {
            //正しい答えが入ってくるのをまつ
            return botui.action.select({
                placeholder: "Select Right Answer",
                value: 1,
                label: "label",
                options: answerData,
                button: {
                    icon: 'check',
                    label: 'OK'
                }
            })
        }).then(function (res) {
            //global変数にいれる
            data += [j, res.value]
        })
    }

    //プログラムを終了する処理
    function end() {
        botui.message.bot({
            content: 'またね！';
        })
    }
})();