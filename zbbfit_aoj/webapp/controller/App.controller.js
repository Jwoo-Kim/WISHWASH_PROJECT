sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel"
    ],
    function(BaseController, JSONModel) {
      "use strict";
  
      return BaseController.extend("sap.btp.zbbfitaoj.controller.App", {
        onInit() {

          // this.getView()
          //     .setModel( new JSONModel({
          //       main: {
          //         btn : false
          //       },

          //       detail: {
          //         btn : false
          //       }
          //     }), 'controller' )

        }
      });
    }
  );
  