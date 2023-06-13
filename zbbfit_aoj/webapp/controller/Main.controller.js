sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/library",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Text"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Filter, MessageToast, MessageBox, coreLibrary, Dialog, Button, mobileLibrary, Text) {
        "use strict";

        return Controller.extend("sap.btp.zbbfitaoj.controller.Main", {
            onInit: function () {   
                const oComponent = this.getOwnerComponent(),
                      oRouter = oComponent.getRouter(),
                      oView = this.getView();

                sap.ui.getCore().getMessageManager().registerObject(oView, true);

                oRouter.attachRoutePatternMatched(this.onRoutePatternMatched, this );
            },

            onRoutePatternMatched: function() {
                this._viewSetting();
                this._read_zbbfit_aoj_hSet();
            },

            onValidationComoboBoxChange: function(oEvent) {
                const oControl = oEvent.getSource(),
                      sValue = oEvent.getParameter('value'),
                      sSelectedKey = oControl.getSelectedKey();

                let sState = "None",
                    sText = "";

                if(sValue !== sSelectedKey) {
                    sState = "Error";
                    sText = "입력한 값이 리스트에 없습니다.";
                }
                oControl.setValueState(sState);
                oControl.setValueStateText(sText);
            },

            _viewSetting: function() {
                const oView = this.getView();

                let oState = {
                    state : 'Success',
                    selectionMode : 'None'
                };

                let oFilter = oView.byId('filterbar'),
                that = this;

                oFilter.addEventDelegate({
                    "onAfterRendering": function(oEvent) {
                        var oResourceBundle = that.getOwnerComponent().getModel("i18n").getResourceBundle();
    
    
                        var oButton = oEvent.srcControl._oSearchButton;
                        oButton.setText(oResourceBundle.getText("조회"));
                    }
                });

                let oSetting =  {
                    editMode : false
                };

                oView.setModel(new JSONModel(oSetting), 'view');
                oView.setModel(new JSONModel([]), 'table');
                oView.setModel(new JSONModel({}), 'search');
                oView.setModel(new JSONModel(oState), 'inputState')
            },

            _read_zbbfit_aoj_hSet() {

                const oView = this.getView(),
                    oComponent = this.getOwnerComponent(),
                    oTablModel = oView.getModel('table'),
                    oModel = oComponent.getModel();

                oView.setBusy(true);

                var result;

                // debugger;

                return new Promise(function(resolve, reject) {
                    oModel.read('/zbbfit_aoj_hSet', {
                        urlParameters: {
                            $expand: 'items'
                        },
                        success : function(data) {
                            // debugger;
                            resolve(data);
                            result = data.results.sort((a, b) => a.FiNo - b.FiNo);
                            oTablModel.setProperty('/', result);
                            oView.setBusy(false);
                        },
                        error : function() {
                            // debugger;
                            reject('error');
                            oView.setBusy(false);
                        }
                    });
                })
            },

            onEdit: function() {
                const oView = this.getView(),
                        oViewModel = oView.getModel('view'),
                        sModeName = '/editMode',
                        oTable = this.byId('table');
            
                let   oModelInputState = oView.getModel('inputState');
                        
                
                let bEdit = oViewModel.getProperty(sModeName);
                oViewModel.setProperty(sModeName, !bEdit);
                oModelInputState.setProperty("/selectionMode", !bEdit ? 'Multi' : 'None' );

                let aFilter = [];

                if(!bEdit) {
                    aFilter.push(
                        new Filter({
                            filters: [
                              new Filter("FiStyle", "EQ", "GE"),
                              new Filter("FiStyle", "EQ", "PO")
                            ],
                            and: false,
                          })
                    );
                }

                oTable.getBinding('rows').filter(aFilter);
            },

            onDelete: function() {
                const oView = this.getView();
                let   oModelInputState = oView.getModel('inputState');

                const that = this;

                const oTable = this.byId('table'),
                      oTableBinding = oTable.getBinding('rows'),
                      // 'table'에 바인딩되어 있는 정보를 가져옴.
                      oTableModel = oTableBinding.getModel(),
                      // 여러 건 선택한 데이터들을 개별적으로 접근하기 위함.
                      aSelectedIndices = oTable.getSelectedIndices(),
                      oModel = this.getView().getModel();

                      // 역분개 처리시 메시지 박스 표시
                    MessageBox.confirm("역분개를 처리하시겠습니까?", {
                        title: "역분개 저장",
                        initialFocus: sap.m.MessageBox.Action.CANCEL,
                        onClose: function (sButton) {
                            if (sButton === MessageBox.Action.CANCEL) {
                                MessageToast.show("역분개 처리가 취소되었습니다.", {width:'20em'});
                                return;
                            } else if (sButton === MessageBox.Action.OK) {

                                let oCallback = {
                                    // groupId : "multi",
                                    success: function() {
                                        console.log("update successed")
                                        // debugger;
                                    },
                                    error : function() {
                                        console.log("update failed")
                                        // debugger;
                                    }
                                };


                                // 반제처리가 된 원전표 번호를 저장할 배열
                                let oPaymentFlagIs =  [];
                                
                                if(aSelectedIndices.length == 0) {
                                    MessageToast.show("선택된 전표가 없습니다.");
                                }
                                // debugger;

                                let aCancelList= [];

                                aSelectedIndices.forEach(function(value, index){
                                    let oRowContext = oTable.getContextByIndex(value),
                                        sRowPath = oRowContext.getPath();
                
                                    let oRow = oTableModel.getProperty(sRowPath);
                                    
                                    debugger;

                                    if(oRow.Flag === '1') {
                                        aCancelList.push(oRow.FiNo);
                                    }

                                    if(oRow.PaymentFlag === '1' && oRow.FiStyle === 'GE') {
                                        oPaymentFlagIs.push(oRow.FiNo);
                                    }
                
                                });
                
                                debugger;

                                if(aCancelList[0]) {
                                    let msg = "";

                                    for(let i = 0; i < aCancelList.length; i++) {
                                        if(i !== aCancelList.length - 1) {
                                        msg += aCancelList[i] + ", "
                                        } else {
                                        msg += aCancelList[i] + " ";
                                        }
                                    }
                
                                    msg += "이미 역분개가 처리되었습니다.";
                                    // debugger;
                                    MessageBox.error(msg);
                                    // MessageToast.show(msg);
                
                                    aCancelList = [];
                                    return;
                                }
                                
                                // debugger;
                
                                // 반제처리가 된 원전표를 역분개 처리시 역분개가 안되도록 처리
                                if(oPaymentFlagIs[0]) {
                                    let msg = "";
                                    
                                    for(let i = 0; i < oPaymentFlagIs.length; i++) {
                                        if(i !== oPaymentFlagIs.length - 1) {
                                        msg += oPaymentFlagIs[i] + ", "
                                        } else {
                                        msg += oPaymentFlagIs[i] + " ";
                                        }
                                    }
                
                                    msg += "반제전표에 대한 역분개전표를 먼저 생성 해주세요.";
                                    // debugger;
                                    MessageBox.error(msg);
                                    // MessageToast.show(msg);
                
                                    oPaymentFlagIs = [];
                                    return;
                                }
                                
                                that.getView().setBusy(true);

                                Promise.all(
                                    aSelectedIndices.map(function(value, index) {
                                    //
                                        let oRowContext = oTable.getContextByIndex(value),
                                            sRowPath = oRowContext.getPath();
                    
                                        let oRow = oTableModel.getProperty(sRowPath);
                    
                                        // let sKeyName = oModel.createKey("/cancel_billSet", {
                                        //     FiNo : oRow.FiNo
                                        // });
                                        // oModel.update(sKeyName, oRow, oCallback)
                    
                                        return new Promise(function(resolve, reject) {
                                            oModel.create(
                                                "/zbbfit_aoj_hSet", 
                                                {
                                                    FiNo: oRow.FiNo,
                                                    items : [
                                                        {
                                                            FiNo: oRow.items.results[0].FiNo
                                                        }
                                                    ]
                                                }, 
                                                {
                                                    success: function(){
                                                        resolve('success');
                                                    },
                                                    error : function() {
                                                        reject('error');
                                                    }
                                                }
                                            );
                                        })
                    
                                    })
                                ).then(function() {
                                    that._read_zbbfit_aoj_hSet()
                                        .then(function() {
                                            that.onEdit();
                                            MessageToast.show("역분개 처리가 완료되었습니다.");
                                        });
                                }).finally(function() {
                                    that.getView().setBusy(false);
                                })
                

                                // debugger;
                            };
    
                        }
                    });

                    // debugger;

                    // if(oModelInputState.getProperty('/check') === 'No'){
                    //     oModelInputState.setProperty('/check', '');
                    //     return;
                    // }

                // let oCallback = {
                //     // groupId : "multi",
                //     success: function() {
                //         console.log("update successed")
                //         debugger;
                //     },
                //     error : function() {
                //         console.log("update failed")
                //         debugger;
                //     }
                // };


                // // 반제처리가 된 원전표 번호를 저장할 배열
                // let oPaymentFlagIs =  [];

                // aSelectedIndices.forEach(function(value, index){
                //     let oRowContext = oTable.getContextByIndex(value),
                //         sRowPath = oRowContext.getPath();

                //     let oRow = oTableModel.getProperty(sRowPath);

                //     if(oRow.PaymentFlag === '1' && oRow.FiStyle === 'GE') {
                //         oPaymentFlagIs.push(oRow.FiNo);
                //     }

                // }, this);

                // // debugger;

                // // 반제처리가 된 원전표를 역분개 처리시 역분개가 안되도록 처리
                // if(oPaymentFlagIs[0]) {
                //     let msg = "";
                    
                //     for(let i = 0; i < oPaymentFlagIs.length; i++) {
                //         if(i !== oPaymentFlagIs.length - 1) {
                //         msg += oPaymentFlagIs[i] + ", "
                //         } else {
                //         msg += oPaymentFlagIs[i] + " ";
                //         }
                //     }

                //     msg += "반제전표에 대한 역분개전표를 먼저 생성 해주세요.";
                //     // debugger;
                //     MessageBox.error(msg);
                //     // MessageToast.show(msg);

                //     oPaymentFlagIs = [];
                //     return;
                // }

                // aSelectedIndices.forEach(function(value, index) {
                //     //
                //     let oRowContext = oTable.getContextByIndex(value),
                //         sRowPath = oRowContext.getPath();

                //     let oRow = oTableModel.getProperty(sRowPath);

                //     // let sKeyName = oModel.createKey("/cancel_billSet", {
                //     //     FiNo : oRow.FiNo
                //     // });
                //     // oModel.update(sKeyName, oRow, oCallback)

                    

                //     oModel.create(
                //         "/zbbfit_aoj_hSet", 
                //         {
                //             FiNo: oRow.FiNo,
                //             items : [
                //                 {
                //                     FiNo: oRow.items.results[0].FiNo
                //                 }
                //             ]
                //         }, 
                //         {
                //             success: function(){
                //                 this._read_zbbfit_aoj_hSet()
                //                     .then(function() {
                //                         this.onEdit();
                //                     }.bind(this));
                //             }.bind(this),
                //             error : function() {
                //                 console.log('업데이트를 하는 과정에서 실패했습니다.');
                //                 debugger;
                //             }
                //         }
                //     );

                // }, this);          

            },
            onCancel: function() {
                const oView = this.getView(),
                        oViewModel = oView.getModel('view'),
                        sModeName = '/editMode';
                        // oTable = this.byId('table');
            
                let     oTable = this.byId('table'),
                        oBinding = oTable.getBinding('rows');

                let   oModelInputState = oView.getModel('inputState');
                        
                
                let bEdit = oViewModel.getProperty(sModeName);
                oViewModel.setProperty(sModeName, !bEdit);
                oModelInputState.setProperty("/selectionMode", !bEdit ? 'Multi' : 'None' );

                oBinding.filter([])
                
                // debugger;

            },
            onSave: function() {
                const oView = this.getView(),
                        oViewModel = oView.getModel('view'),
                        sModeName = '/editMode';
                let   oModelInputState = oView.getModel('inputState');
                        
                // oModelInputState.setProperty('/selectionMode' , 'None');
                
                oModelInputState.setProperty('/selectionMode' , 'false');
                
                let bEdit = oViewModel.getProperty(sModeName);
                oViewModel.setProperty(sModeName, !bEdit);
            },

            onChangeFrom: function(oEvent) {
                // debugger;
                
            },

            onChangeTo: function(oEvent) {

            },

            _validationCheck: function() {
                let aIds = this._getIds();
                
                let bCheck = true;
                debugger;

                aIds.forEach(function(sId) {
                    if (this.byId(sId)) {
                        if(this.byId(sId).getValueState() === "Error") bCheck = false;
                    }
                    
                }, this)

                return bCheck;
            },

            /**
             * 필터조건으로 검색하는 함수
             */
            onSearch: function() {
                const oTable = this.byId('table'),
                    oBinding = oTable.getBinding('rows'),
                    oView = this.getView(),
                    oSearchModel = oView.getModel('search');

                let bValidation = this._validationCheck();

                if(!bValidation) {
                    return MessageBox.error("조회조건에 유효하지 않은 값이 있습니다.");
                }

                let oSearchData = oSearchModel.getProperty('/');
                let aFilter = [];
                

                if(oSearchData.FiStyle){
                    aFilter.push(
                        new Filter("FiStyle", 'EQ', oSearchData.FiStyle)
                    );
                }

                if(oSearchData.FiYear) {
                    aFilter.push(
                        new Filter("FiYear", 'EQ', oSearchData.FiYear)
                    );
                }

                if(oSearchData.FiNo) {
                    aFilter.push(
                        new Filter("FiNo", 'EQ', oSearchData.FiNo)
                    );
                }

                if(oSearchData.FiPostDateFrom) {
                    aFilter.push(new Filter("FiPostDate", 'BT', oSearchData.FiPostDateFrom, new Date(oSearchData.FiPostDateTo.getFullYear(), oSearchData.FiPostDateTo.getMonth(), oSearchData.FiPostDateTo.getDate(), 23, 59, 59)));
            }

                oBinding.filter(aFilter);
            },

            onInputChange: function(oEvent) {
                
                const oControl = oEvent.getSource(),
                        sValue = oControl.getValue(),
                        iValue = +sValue, 
                        oView = this.getView(),
                        oModel = oView.getModel('inputState');
                let oMOdelData;
                let sText = "None", stateText = '';

                // if(sValue.length != 10 || sValue === '') {
                //     sText = "Error";
                // } else {
                //     sText = "Success";
                // }

                // if(typeof sValue == 'number'){
                //     sText = "Error";
                // }
                
                if(sValue === '' || (typeof iValue == 'number' && sValue.length === 10)) {
                    sText = "Success";
                } else  {
                    sText = "Error";
                }

                oModel.setProperty('/state', sText);
                oMOdelData = oModel.getProperty('/state');

                if(oMOdelData !== 'Success') {
                    stateText = '10자리 전표번호를 올바르게 입력해주세요';
                    // oControl.setValue(""); 
                }
                oControl.setValueStateText(stateText);
            },

            onChangeDate: function(oEvent) {
                const bValid = oEvent.getParameter('valid'),
                      oControl = oEvent.getSource(),
                      oSearchModel = this.getView().getModel('search');

                let sState = 'None',
                    sStateText = ""

                if(!bValid) {
                    sState = "Error";
                    sStateText = "유효하지 않은 날짜 입니다.";
                    // oSearchModel.setProperty('/FiPostDateFrom', '');
                    // oSearchModel.setProperty('/FiPostDateTo', '');
                }

                oControl.setValueState(sState);
                oControl.setValueStateText(sStateText);
            },

            onRowActionPress: function(oEvent) {
                // oEvent - 이벤트를 발생하면 매개변수를 하나 준다.
                // oEvent.getParameters() -> 해당 이벤트가 가지고 있는 정보에 대해서 전부 돌려준다.
                // oEvent.getParameter('row') -> 'row' 파라미터에 대한 정보를 돌려준다.
                // oRow.getBindingContext -> 클릭한 row에 Binding되어있는 정보문맥을 가져온다.
                // oRowBinding.getPath() -> 바인딩된 path값을 가져온다.
                const oRow = oEvent.getParameter('row'),
                        oRowBinding = oRow.getBindingContext('table'),
                        sRowPath = oRowBinding.getPath(),
                        oTableModel = oRow.getModel('table');

                // oRowData에 table모델에 있는 경로를 찾아서 데이터를 가져온다.
                let oRowData = oTableModel.getProperty(sRowPath);

                const oComponent = this.getOwnerComponent();

                // manifest.json의 router를 가져와서 이동하고자하는 route 이름을 .navTo에 넣으면, 해당 페이지로 이동
                oComponent.getRouter()
                            .navTo("RouteDetail", {
                                FiNo : oRowData.FiNo
                            });
                // const oView = this.getView();
                //             oView.setModel(new JSONModel({}), 'temp');

                // const oModel = oView.getModel('temp');
                //     oModel.setProperty('/FiNo', oRowData.FiNo);

            },

            _getIds : function() {
                return [
                    "FiStyle",
                    "cbFiYear",
                    "FiNoInput",
                    "DateRange",
                ]
            }
        });
    });
