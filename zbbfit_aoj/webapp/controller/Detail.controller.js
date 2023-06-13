sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function(
	Controller, JSONModel, MessageBox, MessageToast
) {
	"use strict";

	return Controller.extend("sap.btp.zbbfitaoj.controller.Detail", {
		onInit: function() {
			const oComponent = this.getOwnerComponent(),
					oRouter = oComponent.getRouter();

				// oRouter.getRoute('RouteDetail') -> manifest.json에 routed라고
				// 되어있는 부분에 'RouteDetail' 정보를 가져온다.
				// attachMatched라는 이벤트함수를 달아주는데
				// Matched 해당 라우트 정보에 접근하면 실행시키는 함수이다.
				oRouter.getRoute('RouteDetail')
					   .attachMatched(this._onRouteMatched, this);

			const otoday = {
				today : new Date() 
			};

			const oView = this.getView();
				  
			oView.setModel(new JSONModel(otoday), 'date');
			
		},

		_onRouteMatched: function(oEvent) {
			// oArguments -> Matched 이벤트에서 발생하는 정보중에서
			// arguments라는 매개변수 속성값을 가져온다.
			// 이게 무슨말이냐면, manifest.json에 RouteDetail Pattern에 파라미터로
			// 되어있는 매개변수의 값을 가져온다.
			// oView -> 화면정보를 가져오고,
			// oModel -> 디폴트모델인 oData모델을 가져온다.
			const oArguments = oEvent.getParameter('arguments'),
					oView = this.getView(),
					oModel = oView.getModel(),
					oTable = this.byId("DetailTable");		


			let oSetting =  {
				editMode : false
			};
			oView.setModel(new JSONModel(oSetting), 'view');
			oView.setModel(new JSONModel({}), 'detail');
			
			this.FiNo = oArguments.FiNo;
			let sKeyName = oModel.createKey('/zbbfit_aoj_hSet', {
				FiNo: oArguments.FiNo
			});
			
			this._zbbfit_aoj_hSet(oModel, sKeyName);
			oTable.bindRows(sKeyName + "/items");

			// Date Model 가져오기
			let	oModelDate = oView.getModel('date'),
				oModelDateData = oModelDate.getProperty('/today');
			
			let oModelDetail = oView.getModel('detail'),
				oModelDetailData = oModelDetail.getProperty('Deadline');

			// debugger;
		},

		_zbbfit_aoj_hSet: function(oModel, sKeyName) {
			const oView = this.getView();
			
			return new Promise(function(resolve, reject) {
				oModel.read(sKeyName, {
					success: function(oData) {
						resolve(oData);
						oView.getModel('detail').setData(oData);
					},
					error: function(error) {
						reject(error);
					}
				});
			});
		},

		formatDate: function(date) {
			if (date) {
				var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
				  pattern: "yyyy.MM.dd"
				});
				return oDateFormat.format(date);
			  }
			  return "";
		},

		onEdit: function() {
			const oView = this.getView(),
                        oViewModel = oView.getModel('view'),
                        sModeName = '/editMode',
						oModel = oView.getModel();
						debugger;
                
                let bEdit = oViewModel.getProperty(sModeName);
                oViewModel.setProperty(sModeName, !bEdit);
		},

		onSave : function() {
			const oView = this.getView(),
				oModel = oView.getModel(),
				oDetailModel = oView.getModel('detail');
			
			const that = this;

				MessageBox.confirm("저장하시겠습니까?", {
                    title: "Confirm",
                    initialFocus: sap.m.MessageBox.Action.CANCEL,
                    onClose: function (sButton) {
                        if (sButton === MessageBox.Action.CANCEL) {
							MessageToast.show("저장이 취소되었습니다.");
                            return;
                        } else if (sButton === MessageBox.Action.OK) {
							let sKeyName = oModel.createKey("/zbbfit_aoj_hSet", {
								FiNo : that.FiNo
							});
				
							let oData = oDetailModel.getProperty("/");
				
							oModel.update(
								sKeyName, 
								oData, 
								{
									success: function(){
										that._zbbfit_aoj_hSet(oModel, sKeyName)
											.then(function() {
												that.onEdit();
												MessageToast.show("저장이 완료되었습니다.");
											});
									},
									error : function() {
										MessageBox.error('업데이트를 하는 과정에서 실패했습니다.');
									}
								}
							);
                        };

                    }
                });
		},

		customColor: function(sFiStyle, sDeadline) {
			let sColor = "None";
			let oToday = new Date();

			if(sDeadline && sFiStyle) {

				let diffMSec = sDeadline.getTime() - oToday.getTime();
				let diffDate = diffMSec / (24 * 60 * 60 * 1000);

				if( sFiStyle === 'PO' ) {
					sColor = "Information"

					return sColor;
				} else {
					// 입금기한 지남
					if(sDeadline - oToday < 0){
						sColor = 'Error'

						return sColor;
					}


					if(sDeadline - oToday > 0) {
						sColor = 'Success';

						debugger;

						if( diffDate == 7 || diffDate < 7 ) {
							sColor = 'Warning';
						}

						
						return sColor;
					}

					// function previsionSevenDate(oToday, sDeadline) {
					// 	const year = sDeadline.getFullYear(),
					// 		  month = sDeadline.getMonth(),
					// 		  day = sDeadline.getDate();

					// 	let oSevenDate = new Date(year, month, day - 7),
					// 		sSeven = oSevenDate.getLocaleDateString(),
					// 		aSplitSevem = sSeven.split(' ');
							
					// 		입금기한 <  ( 입금기한 - 7 ) - 오늘날짜 < 7 || 입금기한 - 오늘날짜 == 0 
					// 		2. 20230107 - 20230101   <=7 -> Warning
					// }
				}
			}

			// 1. 20230101 < 20230110 -> Error
			// 2. 20230107 - 20230101   <=7 -> Warning
			// 3. 20230201 - 20230101 > 7 -> Success
			// 4. 'PO' -> Information  

			return sColor;
		}

	});
});