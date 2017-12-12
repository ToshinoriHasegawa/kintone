(function() {
    "use strict";


    kintone.events.on('app.record.index.show', function(event) {
        
        // ----------------------------------------------------------------------------------------------------
        // 関数
        // ----------------------------------------------------------------------------------------------------
        // 全件取得
        function fetchRecordsALL(appId, opt_offset, opt_limit, opt_records) {
            var offset = opt_offset || 0;
            var limit = opt_limit || 100;
            var allRecords = opt_records || [];
            var params = {app: appId, query: query + ' limit ' + limit + ' offset ' + offset};
            return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
                allRecords = allRecords.concat(resp.records);
                if (resp.records.length === limit) {
                    return fetchRecordsALL(appId, offset + limit, limit, allRecords);
                }
                return allRecords;
            });
        }
        
        // 資料収集日が入力済
        function fetchRecordsS1(appId, opt_offset, opt_limit, opt_records) {
            var offset = opt_offset || 0;
            var limit = opt_limit || 100;
            var allRecords = opt_records || [];
            var params = {app: appId, query: query + 'and dat資料収集日 != "" limit ' + limit + ' offset ' + offset};
            return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
                allRecords = allRecords.concat(resp.records);
                if (resp.records.length === limit) {
                    return fetchRecordsS1(appId, offset + limit, limit, allRecords);
                }
                return allRecords;
            });
        }

        // 給与収集日が入力済
        function fetchRecordsS2(appId, opt_offset, opt_limit, opt_records) {
            var offset = opt_offset || 0;
            var limit = opt_limit || 100;
            var allRecords = opt_records || [];
            var params = {app: appId, query: query + 'and dat給与収集日 != "" limit ' + limit + ' offset ' + offset};
            return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
                allRecords = allRecords.concat(resp.records);
                if (resp.records.length === limit) {
                    return fetchRecordsS2(appId, offset + limit, limit, allRecords);
                }
                return allRecords;
            });
        }

        // 申告書入力日が入力済
        function fetchRecordsS3(appId, opt_offset, opt_limit, opt_records) {
            var offset = opt_offset || 0;
            var limit = opt_limit || 100;
            var allRecords = opt_records || [];
            var params = {app: appId, query: query + 'and dat申告書入力日 != "" limit ' + limit + ' offset ' + offset};
            return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
                allRecords = allRecords.concat(resp.records);
                if (resp.records.length === limit) {
                    return fetchRecordsS3(appId, offset + limit, limit, allRecords);
                }
                return allRecords;
            });
        }

        // 給与入力日が入力済
        function fetchRecordsS4(appId, opt_offset, opt_limit, opt_records) {
            var offset = opt_offset || 0;
            var limit = opt_limit || 100;
            var allRecords = opt_records || [];
            var params = {app: appId, query: query + 'and dat給与入力日 != "" limit ' + limit + ' offset ' + offset};
            return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
                allRecords = allRecords.concat(resp.records);
                if (resp.records.length === limit) {
                    return fetchRecordsS3(appId, offset + limit, limit, allRecords);
                }
                return allRecords;
            });
        }

        // 完了日が入力済
        function fetchRecordsS5(appId, opt_offset, opt_limit, opt_records) {
            var offset = opt_offset || 0;
            var limit = opt_limit || 100;
            var allRecords = opt_records || [];
            var params = {app: appId, query: query + 'and dat完了日 != "" limit ' + limit + ' offset ' + offset};
            return kintone.api('/k/v1/records', 'GET', params).then(function(resp) {
                allRecords = allRecords.concat(resp.records);
                if (resp.records.length === limit) {
                    return fetchRecordsS3(appId, offset + limit, limit, allRecords);
                }
                return allRecords;
            });
        }



        //進捗状況一覧（5365322）
        if (event.viewId === 5365322){
            // 全件取得
            fetchRecordsALL(kintone.app.getId()).then(function(records) {
                // 全件取得
                total = records.length;

                for (var i = 0; i < records.length; i++) {
                    var record = records[i];

                    s2 += parseInt(record['num入力人数']['value'], 10)|0;
                    s3 += parseInt(record['num確認人数']['value'], 10)|0;
                }





            });
    




            var records = event.records;
            // カスタマイズビュー設定時に登録したHTMLの要素を指定します。
            var container = document.getElementById('sheet');
            // Handsontableをインスタンス化
            var hot = new Handsontable(container, {
                // kintoneのレコードデータを指定
                data: records,
                minSpareRows: 0,
                // カラムのヘッダーを指定
                colHeaders: ["担当", "CODE", "関与先"],
                contextMenu: false,
                // dataオプションのどの列を表示するか指定する。
                columns: [
                    {data: "usr担当者.value"},
                    {data: "lkuCODE.value"},
                    {data: "txt関与先名.value"},
                ]
            });
        }

        //年末調整進行表（全て） or 年末調整進行表（担当者）以外は対象外
        if (event.viewId !== 5365129 && event.viewId !== 5365127) {
            return;
        }


        // ----------------------------------------------------------------------------------------------------
        // 期限日アラート表示
        // ----------------------------------------------------------------------------------------------------
        // ロケールを初期化
        moment.locale('ja');
        //システム日付
        var datToday = moment();
        var datLimit1 = '';
        var datLimit2 = '';

        var elLimitDate1 = kintone.app.getFieldElements('dat資料完備予定');
        var elLimitDate2 = kintone.app.getFieldElements('dat納品締切');

        for (var i = 0; i < elLimitDate1.length; i++) {
            var record = event.records[i];
            
            //期限取得
            datLimit1 = record['dat資料完備予定']['value'];
            datLimit2 = record['dat納品締切']['value'];

            if (datLimit1 !== ''){
                //期限の7日前取得
                datLimit1 = moment(datLimit1).add(-7,"days");

                if (moment(datToday).isAfter(moment(datLimit1))){
                    elLimitDate1[i].style.backgroundColor = '#FF5588';
                    elLimitDate1[i].style.fontWeight = 'bold';
                }
            }
            if (datLimit2 !== ''){
                //期限の7日前取得
                datLimit2 = moment(datLimit2).add(-7,"days");
                if (moment(datToday).isAfter(moment(datLimit2))){
                    elLimitDate2[i].style.backgroundColor = '#FF5588';
                    elLimitDate2[i].style.fontWeight = 'bold';
                }
            }

        }

        // ----------------------------------------------------------------------------------------------------
        // 進捗表示
        // ----------------------------------------------------------------------------------------------------
        // 現在の検索条件取得
        var query = kintone.app.getQueryCondition();

        var total = 0;      //合計件数
        var total_p = 0;    //合計人数
        var s1 = 0;         //資料収集日
        var s2 = 0;         //給与収集日
        var s3 = 0;         //申告書入力日
        var s4 = 0;         //給与入力日
        var s5 = 0;         //完了日
        var status = '';    //表示文字列
        var p = 0;          //進捗率計算用
        
//console.log(query);

        fetchRecordsALL(kintone.app.getId()).then(function(records) {
            // 全件取得
            total = records.length;
            status += '<pre><b><td style="font-family:メイリオ">全'+records.length+'件';
            
            // 資料収集日取得
            fetchRecordsS1(kintone.app.getId()).then(function(records) {
                
                s1 = records.length;
                p = (s1/total*100).toFixed(1);
                status += ' 資料収集：'+records.length+'件 ('+p+'%)';
                
                kintone.app.getHeaderMenuSpaceElement().innerHTML = status;

                // 給与収集日取得
                fetchRecordsS2(kintone.app.getId()).then(function(records) {
                    
                    s2 = records.length;
                    p = (s2/total*100).toFixed(1);
                    status += ' 給与収集：'+records.length+'件 ('+p+'%)';
                    
                    // 申告入力日取得
                    fetchRecordsS3(kintone.app.getId()).then(function(records) {
                        
                        s3 = records.length;
                        p = (s3/total*100).toFixed(1);
                        status += ' 申告入力：'+records.length+'件 ('+p+'%)';

                        // 給与入力取得
                        fetchRecordsS4(kintone.app.getId()).then(function(records) {
                            
                            s4 = records.length;
                            p = (s4/total*100).toFixed(1);
                            status += ' 給与入力：'+records.length+'件 ('+p+'%)';
                            
                            // 完了日取得
                            fetchRecordsS5(kintone.app.getId()).then(function(records) {
                                
                                s5 = records.length;
                                p = (s5/total*100).toFixed(1);
                                status += ' 完了：'+records.length+'件 ('+p+'%)</td></b></pre>';

                                kintone.app.getHeaderMenuSpaceElement().innerHTML = status;

                            });
                        });
                    });
                });
            });
        });
    });
})();
