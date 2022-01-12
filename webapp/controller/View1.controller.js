sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/ui/Device",
	"sap/ui/model/Sorter",
	"com/airdit/OdataModel/util/Formatter"
], function (Controller, Filter, FilterOperator, Fragment, Device, Sorter, Formatter) {
	"use strict";

	return Controller.extend("com.airdit.OdataModel.controller.View1", {
		formatter: Formatter,
		
		onInit: function () {
			
			this._mViewSettingsDialogs = {};
			//var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZTEST_MATERIAL_SRV/");
			//sap.ui.getCore().setModel(oModel);
		},

		//SEARCHING EVENT OF SEARCHFIELD

		onFilterPosts: function (oEvent) {
			// build filter array
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new Filter("Matnr", FilterOperator.Contains, sQuery));
			}
			// filter binding
			var oTable = this.byId("task1_table");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilter);
		},

		/*Code for SortDialog Fragment */

		getViewSettingsDialog: function (sDialogFragmentName) {
			var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!pDialog) {
				pDialog = Fragment.load({
					id: this.getView().getId(),
					name: sDialogFragmentName,
					controller: this
				}).then(function (oDialog) {
					if (Device.system.desktop) {
						oDialog.addStyleClass("sapUiSizeCompact");
					}
					return oDialog;
				});
				this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
			}
			return pDialog;
		},

		/* Event for sort button in view */

		handleSortButtonPressed: function () {
			this.getViewSettingsDialog("com.airdit.OdataModel.Fragment.SortDialog") //path for fragment along with function
				.then(function (oViewSettingsDialog) { //Functionality implemented at line 32..
					oViewSettingsDialog.open();
				});
		},

		/* confirm event of DialogBox-->SortDialog */

		handleSortDialogConfirm: function (oEvent) {
			var oTable = this.byId("task1_table"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				sPath,
				bDescending,
				aSorters = [];

			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));

			// apply the selected sort and group settings
			oBinding.sort(aSorters);
		},

		handleFilterButtonPressed: function () {
			this.getViewSettingsDialog("com.airdit.OdataModel.Fragment.FilterDialog")
				.then(function (oViewSettingsDialog) {
					oViewSettingsDialog.open();
				});
		},
		handleFilterDialogConfirm: function (oEvent) {
			var oTable = this.byId("task1_table"),
				mParams = oEvent.getParameters(),
				oBinding = oTable.getBinding("items"),
				aFilters = [];

			mParams.filterItems.forEach(function (oItem) {
				var aSplit = oItem.getKey().split("___"),
					sPath = aSplit[0],
					sOperator = aSplit[1],
					sValue1 = aSplit[2],
					sValue2 = aSplit[3],
					oFilter = new Filter(sPath, sOperator, sValue1, sValue2);
				aFilters.push(oFilter);
			});

			// apply filter settings
			oBinding.filter(aFilters);

			// update filter bar
			this.byId("vsdFilterBar").setVisible(aFilters.length > 0);
			this.byId("vsdFilterLabel").setText(mParams.filterString);
		},

		//Binding Data on click of an Item Selected..

		rowSelect: function (oEvent) {
			this.sElementPath = oEvent.getParameter("listItem").getBindingContext().getPath();
			if (!this.ShowDetails) {
				Fragment.load({
					id: "ShowDetails",
					name: "com.airdit.OdataModel.Fragment.ShowDetails",
					controller: this
				}).then(function (oDialog) {
					this.ShowDetails = oDialog;
					this.getView().addDependent(this.ShowDetails);
					this.ShowDetails.open();
					this.ShowDetails.bindElement(this.sElementPath);
				}.bind(this));

			} else {
				this.ShowDetails.bindElement(this.sElementPath);
				this.ShowDetails.open();
			}

		},
		onClose: function () {
			this.ShowDetails.close();
		}
	});
});