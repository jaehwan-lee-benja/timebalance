const db = firebase.database();
const SELECTBOX_BPTITLE_VALUE_INIT = "INIT";
const userData = {}; 
let objectById = {};
let isMainShown = false;
let eventListenerResult = "";

(function() {
	logIn();
})();

function logIn() {
	firebase.auth().onAuthStateChanged(function (user) {
		if (user != null) {
			StoLDept.requestReadUserData(user);
			StoLDept.requestReadBigPicture(user);
			updateCardDept.openEditCardByDbclick();
			// supportDept.getLayerByEventListener(); // 필요시 활성화
		} else {
			window.location.replace("login.html");
		};
	});
};

function logOut() {
	firebase.auth().signOut();
};

const StoLDept = {
	"requestReadUserData": 
		function requestReadUserData(user) {
			const userRef = db.ref("users").child(user.uid).child("user");
			userRef.on("value", (snapshot) => {
				snapshot.forEach(childSnap => {
					const key = childSnap.key;
					const value = childSnap.val();
					value["uid"] = childSnap.key;
					userData[key] = value;
				});
				userDept.showUserData(userData);
			});
		},
	"requestReadBigPicture":
		function requestReadBigPicture(user) {

			const userRef = db.ref("users").child(user.uid).child("bigPicture");
			
			userRef.on("value", (snapshot) => {
				console.log("**===== .on is here =====");
		
				const v = snapshot.val();
				objectById = {};

				// [질문] 재귀함수는 이 안에 넣어야 정리가 되는듯함, 괜찮을지?
				function requestReadIdAndObjectFromChildren(o){
					// console.log('**requestReadIdAndObjectFromChildren >>',o)
					const c = o.children;
					if(!c) return;
				
					const ids = Object.keys(c);
					if(ids.length == undefined) return;
				
					ids.forEach( id => {
						const v = c[id];
						objectById[id] = v;
						requestReadIdAndObjectFromChildren(v);
					});
				};

				requestReadIdAndObjectFromChildren(v);
				// console.log('**objectById >>',objectById)
		
				StoLDept.showItOnUI_latest();

			});
		},
	"showItOnUI_latest":
		function showItOnUI_latest() {
		
			const idThreadObjectKeysArray = ["character", "direction", "roadmap", "actionPlan"];

			idThreadObjectKeysArray.forEach(eachLayer => {

				const latestIdOfEachLayer = idDept.getLatestIdByLayer(eachLayer);
				
				if(latestIdOfEachLayer != null) {

					const mainId = mainCardDept.getMainId();
				
					if(mainId != null && isMainShown == false) {
						isMainShown = true;
						UIDept.showItOnUI("character", mainId);
					} else {	
						UIDept.showItOnUI(eachLayer, latestIdOfEachLayer);
					};
					UIDept.setupBtnShowOrHideByClassName(eachLayer, "readCard");
					selectboxDept.updateSelectbox(eachLayer);
				} else {
					UIDept.showItIfNoCard(eachLayer);
					selectboxDept.updateSelectbox(eachLayer);
				};
			});
		}
	// 	switchedRef.child(inputId)
	//		.set(packagedDataHere, (e) => {
	// 		request_followupEditedDate(layerHere, packagedDataHere);
	// 		alert("저장되었습니다.");});
	// 		// [해결] 문서에서는 then(), catch()를 씀. 차이점? 
	// 		// 참조: https://firebase.google.com/docs/database/web/read-and-write?hl=ko
	// 		// 문서 버전을 함께 확인하기, 
	//		// [질문] 버전확인 방법
};

const LtoSDept = {
	"request_followupEditedDate":
		function request_followupEditedDate(layerHere, packagedDataHere, cb) {

			let idThreadObjectKeysArray = [];
			const idThreadObject = idDept.getIdThreadObjectByPackagedData(layerHere, packagedDataHere);

			switch(layerHere) {
				case "character" :
					// 해당 없음
					break;
				case "direction" :
					idThreadObjectKeysArray = ["character"];
					break;
				case "roadmap" :
					idThreadObjectKeysArray = ["character", "direction"];
					break;
				case "actionPlan" :
					idThreadObjectKeysArray = ["character", "direction", "roadmap"];
					break;
				default : null;
			};

			if (layerHere != "character") {
				const lastCount = idThreadObjectKeysArray.length;
				if(lastCount != 0) {
					let counter = 0;
					idThreadObjectKeysArray.forEach(eachLayer => {
						const editedDateForParents = {"editedDate": packagedDataHere.editedDate};
						const eachId = idThreadObject[eachLayer+"Id"];
						const switchedRef = switchDept.getRefBySwitchLayer(eachLayer, idThreadObject);
						switchedRef.child(eachId)
						.update(editedDateForParents, (e) => {
							console.log("**followupEditedDate completed = ", e);
							if(++counter == lastCount) {
								cb();
							}
						});
					});
				};
			} else {
				cb();
			};
		}
};
	
const userDept = {
	"showUserData":
	function showUserData(userDataHere) {
		const userName = userDataHere.name;
		const userEmail = userDataHere.email;
		document.getElementById("nameChecked").innerHTML = "방문자: " + userName + " 대표";
		document.getElementById("emailChecked").innerHTML = "(" + userEmail + ")"+"		";
	}
};

const UIDept = {
	"showEmptyCard": 
		function showEmptyCard(layerHere) {
			document.getElementById(layerHere).value = "";
		},
	"showItOnUI": 
		function showItOnUI(layerHere, idHere) {
			if (idHere != null) {
				document.getElementById(layerHere).value = objectById[idHere].contents[layerHere];
				document.getElementById("cardId_"+layerHere).value = objectById[idHere].id;
				document.getElementById("cardParentsId_"+layerHere).value = objectById[idHere].parentsId;
			} else {
				UIDept.showEmptyCard(layerHere);
			};
			UIDept.setupBtnShowOrHideByClassName(layerHere,"readCard");
		},
	"showItOnUI_followup":
		function showItOnUI_followup(layerHere, idHere) {
			function showItOnUI_latest_byLayerCondition(layer1, layer2, layer3, layer4) {
			
				const idThreadObjectKeysArray = [layer1, layer2, layer3, layer4];
			
				idThreadObjectKeysArray.forEach(eachLayer => {
					if (eachLayer != undefined) {
						const latestIdOfEachLayer = idDept.getLatestIdByLayer(eachLayer);
						if(latestIdOfEachLayer != null) {
							UIDept.showItOnUI(eachLayer, latestIdOfEachLayer);
							UIDept.setupBtnShowOrHideByClassName(eachLayer, "readCard");
						} else {
							UIDept.showItIfNoCard(eachLayer);
						};
						selectboxDept.updateSelectbox(eachLayer);
					};
				});
			};
			
			switch(layerHere) {
				case "character" :
					showItOnUI_latest_byLayerCondition("direction", "roadmap", "actionPlan");
					break;
				case "direction" :
					showItOnUI_latest_byLayerCondition("roadmap", "actionPlan");
					break;
				case "roadmap" :
					showItOnUI_latest_byLayerCondition("actionPlan");
					break;
				case "actionPlan" :
					// 해당없음
					break;
				default : null;
			};
		},
	"hideUI":
		function hideUI(id) {
			document.getElementById(id).style.display = "none";
		},
	"showUI":
		function showUI(id) {
			document.getElementById(id).style.display = "initial";
		},
	"setupBtnShowOrHideByClassName":
		function setupBtnShowOrHideByClassName(layerHere, state) {

			// 카드 안내 글씨 지우기
			if(layerHere != "character") {
				const parentsLayer = switchDept.getParentsLayerBySwitchLayer(layerHere);
				const parentsCardValue = document.getElementById(parentsLayer).value;
				const alertTextElement = document.getElementById("alert_txt_"+layerHere);
				if(parentsCardValue != "" && alertTextElement.innerText != "") {
					alertTextElement.innerHTML = "";
				};
			};
		
			// 일단 모두 가리기
			UIDept.hideUI("openEditCard_btn_"+layerHere);
			UIDept.hideUI("cancelEditCard_btn_"+layerHere);
			UIDept.hideUI("saveEditedCard_btn_"+layerHere);
			UIDept.hideUI("saveNewCard_btn_"+layerHere);
			UIDept.hideUI("removeCard_btn_"+layerHere);
			UIDept.hideUI("openNewCard_btn_"+layerHere);
		
			// 모드에 따라 설정하기
			switch(state){
				case "createFirstCard" :
					UIDept.showUI("saveNewCard_btn_"+layerHere);
					UIDept.setupTextareaModeByClassName(layerHere, "editing");
					break;
				case "openNewCard" :
					UIDept.showUI("saveNewCard_btn_"+layerHere);
					UIDept.showUI("cancelEditCard_btn_"+layerHere)
					UIDept.showGuideMessage_forFirstCard();
					UIDept.setupTextareaModeByClassName(layerHere, "editing");
					break;
				case "readCard" :
					UIDept.showUI("openEditCard_btn_"+layerHere);
					UIDept.showUI("openNewCard_btn_"+layerHere);
					UIDept.showUI("removeCard_btn_"+layerHere);
					UIDept.setupTextareaModeByClassName(layerHere, "reading");
					break;
				case "editCard" :
					UIDept.showUI("saveEditedCard_btn_"+layerHere);
					UIDept.showUI("cancelEditCard_btn_"+layerHere);
					UIDept.showUI("saveNewCard_btn_"+layerHere);
					UIDept.showUI("removeCard_btn_"+layerHere);
					UIDept.setupTextareaModeByClassName(layerHere, "editing");
					UIDept.editCard_followup(layerHere);
					break;
				case "inactiveCard" :
					UIDept.setupTextareaModeByClassName(layerHere, "reading");
					document.getElementById("alert_txt_"+layerHere).innerHTML = "(상위 카드 작성 후, 작성 가능)";
					break;
				default:
					const state = null;
			};
			
			if(layerHere == "character") {
				function setupBtnShowOrHideByClassName_main(layerHere) {
		
					UIDept.hideUI("gotoMainCard_btn_"+layerHere);
					UIDept.hideUI("setMainCard_btn_"+layerHere);
					UIDept.hideUI("setMainCard_txt_"+layerHere);
				
					const cardId = document.getElementById("cardId_character").value;
					const mainId = mainCardDept.getMainId();
				
					if(cardId == mainId) {
						UIDept.showUI("setMainCard_txt_"+layerHere);
					} else {
						if (mainId != null) {
							UIDept.showUI("gotoMainCard_btn_"+layerHere);
							UIDept.showUI("setMainCard_btn_"+layerHere);
						} else {
							UIDept.showUI("setMainCard_btn_"+layerHere);
						};
					};
				};
				setupBtnShowOrHideByClassName_main(layerHere, state);
			};

			const eachCardValue = document.getElementById(layerHere).value;
			if(eachCardValue != "") {
				console.log("layerHere =", layerHere);
				UIDept.hideUI("guideMessage");
			} else {
				UIDept.showUI("guideMessage");
			};
			UIDept.resizeTextarea();
		},
	"setupTextareaModeByClassName":
		function setupTextareaModeByClassName(layerHere, cardMode) {
			if (cardMode == "editing") {
				document.getElementsByClassName(layerHere)[0].style.color = "#9CC0E7";
				document.getElementsByClassName(layerHere)[0].style.borderColor = "#9CC0E7";
				UIDept.setupTextareaBorderColorByClass(layerHere, "3px", "#9CC0E7");
				UIDept.setupTextareaReadOnly(layerHere, false);
			} else {
				document.getElementsByClassName(layerHere)[0].style.color = "#424242";
				document.getElementsByClassName(layerHere)[0].style.borderColor = "#424242";
				UIDept.setupTextareaBorderColorByClass(layerHere, "1px", "#c8c8c8");
				UIDept.setupTextareaReadOnly(layerHere, true);
			};
		},
	"setupTextareaReadOnly":
		function setupTextareaReadOnly(id, trueOrFalse){
			document.getElementById(id).readOnly = trueOrFalse;
		},
	"editCard_followup":
		function editCard_followup(layerHere) {
			// children카드가 0개일 시, inactive 처리하기
			const childrenLayer = switchDept.getChildrenLayerBySwitchLayer(layerHere);
			if (childrenLayer != null) {
				const childrenIdArray = idDept.getEveryIdArrayOfLayer(childrenLayer);
				// children 카드에 아무것도 없으면, inactive 있으면, read로 읽기
				if(childrenIdArray.length == 0) {
					UIDept.setupBtnShowOrHideByClassName(childrenLayer, "inactiveCard");
				} else {
					UIDept.setupBtnShowOrHideByClassName(childrenLayer, "readCard");
				};
			};
			if (layerHere != "character") {
			const parentsLayer = switchDept.getParentsLayerBySwitchLayer(layerHere);
			UIDept.setupTextareaModeByClassName(parentsLayer, "reading");
			};
		},
	"setupTextareaBorderColorByClass":
		function setupTextareaBorderColorByClass(layerHere, px, color) {
			setTimeout(()=>{
				const selectorTextareaOnCard = document.getElementsByClassName(layerHere);
				for (let i = 0; i < selectorTextareaOnCard.length; i++) {
					selectorTextareaOnCard[i].parentNode.style.border = "solid " + px + color;
				};
			},1);
		},
	"resizeTextarea":
		function resizeTextarea() {
			// 참고: https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
			const tx = document.getElementsByTagName("textarea");
			for (let i = 0; i < tx.length; i++) {
				tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
				tx[i].addEventListener("input", OnInput, false);
			};
			function OnInput() {
				this.style.height = "auto";
				this.style.height = (this.scrollHeight) + "px";
			};
		},
	"showItIfNoCard":
		function showItIfNoCard(layerHere) {
		
			UIDept.showEmptyCard(layerHere);
		
			if(layerHere == "character") {
				UIDept.setupBtnShowOrHideByClassName(layerHere,"createFirstCard");
				UIDept.editCard_followup(layerHere);
			} else {
				// direction 카드부터는 부모 레이어가 0이 아닌 경우에만, showEmptyCard(=createFirstCard)를 진행한다.
				const parentLayer = switchDept.getParentsLayerBySwitchLayer(layerHere);
				const parentsIdArrayLength = idDept.getEveryIdArrayOfLayer(parentLayer).length;
		
				if(parentsIdArrayLength != 0) {
					UIDept.setupBtnShowOrHideByClassName(layerHere,"createFirstCard");
					UIDept.editCard_followup(layerHere);
				} else {
					UIDept.setupBtnShowOrHideByClassName(layerHere, "inactiveCard");
				};
			};
			UIDept.showGuideMessage_forFirstCard();
		},
	"showGuideMessage_forFirstCard":
		function showGuideMessage_forFirstCard() {
			console.log("check");
			const guideMessage = document.getElementById("guideMessage");
			const guideMessageValue = document.getElementById("guideMessage").innerText;
			console.log("guideMessageValue =", guideMessageValue);
			if (guideMessageValue == "") {
				console.log("check2");
				guideMessage.style.color = "#9CC0E7";
				guideMessage.innerHTML = "'파란색 네모칸에 내용을 작성해보세요~!'"
			};
		},
	"highLightBorder":
		function highLightBorder(id, color) {
			return document.getElementById(id).style.borderColor = color;
		}
};

const listDept = {
	"updateList": 
		function updateList(layerHere) {
			const listId = "list_"+layerHere;
			const list = document.getElementById(listId);
			const liElements = list.getElementsByTagName("LI");
			// list 초기화하기
			for(let i=liElements.length-1; i>=0; i-- ){
				liElements[i].remove()
			};
			// Array 만들기
			const mappedArray = listDept.getMappedObject_idEditedDateContents(layerHere);
			// list 순서 잡기(최근 편집 순서)
			const sortedArray = listDept.sortingArray(mappedArray);
			// li 생성하기
			for (let i = 0; i < sortedArray.length; i++) {
				const liValue = sortedArray[i][layerHere];
				const listItem = document.createElement('li');
				listItem.innerHTML = liValue;
				list.appendChild(listItem);
			};
		},
	"getMappedObject_idEditedDateContents":
		function getMappedObject_idEditedDateContents(layerHere) {		
			const returnArray = [];
			const eachIdArrayByLayer = idDept.getEveryIdArrayOfLayer(layerHere);
			eachIdArrayByLayer.forEach(EachId => {
				let returnObject = {};
				returnObject["id"] = objectById[EachId].id;
				returnObject["editedDate"] = objectById[EachId].editedDate;
				returnObject[layerHere] = objectById[EachId].contents[layerHere];
				returnArray.push(returnObject);
			});
			return returnArray;
		},
	"sortingArray":
		function sortingArray(mappedArrayHere){
			mappedArrayHere.sort(
				(a,b) => new Date(b.editedDate) - new Date(a.editedDate)
			);
			return mappedArrayHere;
		}
};

const selectboxDept = {
	"updateSelectbox":
		function updateSelectbox(layerHere) {

			const selectboxId = "selectbox_"+layerHere;
			const selectbox = document.getElementById(selectboxId);
		
			// selectbox 초기화
			for (let i = selectbox.options.length - 1; i >= 0; i--) {
				selectbox.remove(i + 1);
			};
		
			// Array 만들기
			const mappedArray = listDept.getMappedObject_idEditedDateContents(layerHere);
		
			// selectbox option list 순서 잡기(최근 편집 순서)
			const sortedArray = listDept.sortingArray(mappedArray);
		
			// <option> 만들어서, Array 넣기
			for (let i = 0; i < sortedArray.length; i++) {
				const option = document.createElement("OPTION");
				const optionId = sortedArray[i].id;
				const optionValue = sortedArray[i][layerHere];
				const txt = document.createTextNode(optionValue);
				const mainId = mainCardDept.getMainId();
				if(optionId == mainId) {
					const mainOptionMark = optionValue + " ★";
					const mainTxt = document.createTextNode(mainOptionMark);
					option.appendChild(mainTxt);
				} else {
					option.appendChild(txt);
				};
				option.setAttribute("value", optionId);
				option.setAttribute("innerHTML", optionValue);
				selectbox.insertBefore(option, selectbox.lastChild);
			};
		
			// listDept.updateList(layerHere, sortedArray);
		
		},
	"selectBySelectbox":
		function selectBySelectbox(layerHere) {
			const selectboxId = "selectbox_"+layerHere;
			const id = document.getElementById(selectboxId).value;
			if(id != SELECTBOX_BPTITLE_VALUE_INIT) {
				UIDept.showItOnUI(layerHere, id);
				UIDept.showItOnUI_followup(layerHere, id);
			};
		}
};

const mainCardDept = {
	"setMainCard":
		function setMainCard() {
			const characterId = document.getElementById("cardId_character").value;
			mainCardDept.requestUpdateMainCard(characterId);
		},
	"gotoMainCard":
		function gotoMainCard() {
			const mainId = mainCardDept.getMainId();
			UIDept.showItOnUI("character", mainId);
			selectboxDept.updateSelectbox("character");
		},
	"getMainId":
		function getMainId() {
			const characterIdArray = idDept.getEveryIdArrayOfLayer("character");
			let mainId = "";
			characterIdArray.forEach(eachId => {
				if(objectById[eachId].main == "main") {
					mainId = eachId;
				};
			});
			if (mainId != ""){
				return mainId;
			} else {
				return null;
			};
		},
	"requestUpdateMainCard":
		function requestUpdateMainCard(idHere) {
			const characterIdArray = idDept.getEveryIdArrayOfLayer("character");
			characterIdArray.forEach(eachId => {
				let setMainValue = {};
				if (eachId == idHere) {
					setMainValue = {
						"main": "main",
						"editedDate": supportDept.getTimeStamp()
					};
				} else {
					setMainValue = {
						"main": ""
					};
				};
				db.ref("users")
				.child(userData.uid)
				.child("bigPicture")
				.child("children")
				.child(eachId)
				.update(setMainValue, (e) => {
					console.log("**updateMainCard completed = ", e);
					});
			});
		}
}

const newCardDept = {
	"saveNewCard":
		function saveNewCard(layerHere) {
			const packagedData = newCardDept.packageNewCard(layerHere);
			if (packagedData != null) {
				newCardDept.requestSetCard(layerHere, packagedData);
				UIDept.showItOnUI_followup(layerHere, packagedData.id);
			};
		},
	"packageNewCard":
		function packageNewCard(layerHere) {
			const monitorResult = monitorDept.monitorCardBlankOrDuplicates(layerHere);
			if (monitorResult) {
				const catchedData = newCardDept.catchContentsDataBySwitchLayer(layerHere);
				const idNew = newCardDept.getUuidv4();
				catchedData["id"] = idNew;
				catchedData["children"] = "";
				catchedData["createdDate"] = supportDept.getTimeStamp();
				catchedData["editedDate"] = supportDept.getTimeStamp();
				catchedData["main"] = "";
				catchedData["layer"] = layerHere;
				return catchedData;
			};
		},
	"catchContentsDataBySwitchLayer":
		function catchContentsDataBySwitchLayer(layerHere) {
			
			const catchContentsData = {};
			catchContentsData["contents"] = {};
			const contents = catchContentsData["contents"];
		
			switch(layerHere){
				case "character" :
					catchContentsData["parentsId"] = "";
					contents["character"] = document.getElementById("character").value.trim();
					break;
				case "direction" :
					catchContentsData["parentsId"] = supportDept.getCardId("character");
					contents["direction"] = document.getElementById("direction").value.trim();
					break;
				case "roadmap" :
					catchContentsData["parentsId"] = supportDept.getCardId("direction");
					contents["roadmap"] = document.getElementById("roadmap").value.trim();
					// contents["roadmapA"] = document.getElementById("roadmapA").value.trim();
					// contents["roadmapB"] = document.getElementById("roadmapB").value.trim();
					break;
				case "actionPlan" :
					catchContentsData["parentsId"] = supportDept.getCardId("roadmap");
					contents["actionPlan"] = document.getElementById("actionPlan").value.trim();
					break;
				default:
					const layerHere = null;
			};
			return catchContentsData;
		},
	"getUuidv4":
		function getUuidv4() {
			return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
			(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
			);
		},
	"requestSetCard": 
		function requestSetCard(layerHere, packagedDataHere) {
			const inputId = packagedDataHere.id;
			const idThreadObject = idDept.getIdThreadObjectByPackagedData(layerHere, packagedDataHere);

			const switchedRef = switchDept.getRefBySwitchLayer(layerHere, idThreadObject);

			switchedRef.child(inputId)
			.set(packagedDataHere)
			.then((e) => {
				LtoSDept.request_followupEditedDate(layerHere, packagedDataHere, function(){
					alert("저장되었습니다.");
				});
			});

		},
	"openNewCard":
		function openNewCard(layerHere) {
			document.getElementById("cardId_"+layerHere).value = "";
			UIDept.showEmptyCard(layerHere);
			UIDept.setupBtnShowOrHideByClassName(layerHere,"openNewCard");
			newCardDept.openNewCard_followup(layerHere);
		},
	"openNewCard_followup":
		function openNewCard_followup(layerHere) {			
			switch(layerHere) {
				case "character" :
					newCardDept.openNewCard_followupBySwitchLayer("direction", "roadmap", "actionPlan");
					break;
				case "direction" :
					newCardDept.openNewCard_followupBySwitchLayer("roadmap", "actionPlan");
					break;
				case "roadmap" :
					newCardDept.openNewCard_followupBySwitchLayer("actionPlan");
					break;
				case "actionPlan" :
					// 해당없음
					break;
				default : null;
			};
		},
	"openNewCard_followupBySwitchLayer":
		function openNewCard_followupBySwitchLayer(layer1, layer2, layer3, layer4) {
			const idThreadObjectKeysArray = [layer1, layer2, layer3, layer4];
			idThreadObjectKeysArray.forEach(eachLayer => {
				if (eachLayer != undefined) {
					UIDept.showEmptyCard(eachLayer);
					UIDept.setupBtnShowOrHideByClassName(eachLayer, "inactiveCard");
				};
			});
		},
};

const updateCardDept = {
	"saveEditedCard":
		function saveEditedCard(layerHere) {
			const packagedData = updateCardDept.packageEditedCard(layerHere);
			if (packagedData != null) {
				updateCardDept.requestUpdateCard(layerHere, packagedData);
			};
		},
	"packageEditedCard":
		function packageEditedCard(layerHere) {	

			const resultIsChanged = updateCardDept.monitorIfCardChanged(layerHere);
			const monitorResult = updateCardDept.getMoniterResult(layerHere, resultIsChanged);
			
			if (monitorResult) {
				const packagedData = {};
				packagedData["id"] = supportDept.getCardId(layerHere);
				packagedData["parentsId"] = document.getElementById("cardParentsId_"+layerHere).value;
				packagedData["editedDate"] = supportDept.getTimeStamp();
				packagedData["contents"] = {};
		
				const contents = packagedData["contents"];
				switch(layerHere){
					case "character" :
						contents["character"] = document.getElementById("character").value.trim();
						break;
					case "direction" :
						contents["direction"] = document.getElementById("direction").value.trim();
						break;
					case "roadmap" :
						contents["roadmap"] = document.getElementById("roadmap").value.trim();
						// contents["roadmapA"] = document.getElementById("roadmapA").value.trim();
						// contents["roadmapB"] = document.getElementById("roadmapB").value.trim();
						break;
					case "actionPlan" :
						contents["actionPlan"] = document.getElementById("actionPlan").value.trim();
						break;
					default: 
						const layer = null;
				};
				return packagedData;
			};
		},
	"monitorIfCardChanged":
		function monitorIfCardChanged(layerHere) {
			
			// 현재 UI에 띄워진 값 포착하기
			const id = supportDept.getCardId(layerHere);
			const value = document.getElementById(layerHere).value.trim();
			const object = {"id": id, [layerHere]: value};

			// 로컬 데이터에 있는 값 포착하기
			const arrayWithId = updateCardDept.getMappedObject_idContents(layerHere);
		
			// 위 두가지가 같은 경우의 수라면, 수정이 이뤄지지 않은 상태
			for(let i = 0; i < arrayWithId.length; i++) {
				if(JSON.stringify(object) === JSON.stringify(arrayWithId[i])) {
					return false;
				};
			};
			return true;
		},
	"getMappedObject_idContents":
		function getMappedObject_idContents(layerHere) {		
			const returnArray = [];
			const eachIdArrayByLayer = idDept.getEveryIdArrayOfLayer(layerHere);
			eachIdArrayByLayer.forEach(EachId => {
				const returnObject = {};
				returnObject["id"] = objectById[EachId].id;
				returnObject[layerHere] = objectById[EachId].contents[layerHere];
				returnArray.push(returnObject);
			});
			return returnArray;
		},
	"getMoniterResult":
		function getMoniterResult(layerHere, isChangedHere) {
			if (isChangedHere) {
				const monitorResultInFunction = monitorDept.monitorCardBlankOrDuplicates(layerHere);
				return monitorResultInFunction;
			} else {
				return true;
			};
		},
	"requestUpdateCard":
		function requestUpdateCard(layerHere, packagedDataHere) {
			const inputId = packagedDataHere.id;
			const idThreadObject = idDept.getIdThreadObjectByPackagedData(layerHere, packagedDataHere);
			const switchedRef = switchDept.getRefBySwitchLayer(layerHere, idThreadObject);
			switchedRef.child(inputId)
			.update(packagedDataHere, (e) => {
				LtoSDept.request_followupEditedDate(layerHere, packagedDataHere, function(){
					alert("수정되었습니다.");
				});
				console.log("**update completed = ", e);
			});
		},
	"openEditCardByDbclick":
		function openEditCardByDbclick() {
			const textareaOnCard = document.getElementsByTagName("textarea");
			for (let i = 0; i < textareaOnCard.length; i++) {
				textareaOnCard[i].addEventListener("dblclick", function (e) {
					const layer = e.target.id;
					const idArray = idDept.getEveryIdArrayOfLayer(layer);
					const readOnlyCondition = textareaOnCard[i].readOnly;
					if(idArray.length > 0 && readOnlyCondition){
						updateCardDept.openEditCard(layer);
					}else if(idArray.length = 0){
						newCardDept.openNewCard(layer);
					};
				});
			};
		},
	"openEditCard":
		function openEditCard(layerHere) {
			UIDept.setupBtnShowOrHideByClassName(layerHere,"editCard");
		},
	"cancelEditCard":
		function cancelEditCard(layerHere) {
			const cardId = supportDept.getCardId(layerHere);
			if(cardId != ""){
				UIDept.showItOnUI(layerHere, cardId);
				const childrenLayer = switchDept.getChildrenLayerBySwitchLayer(layerHere);
				if (childrenLayer != null) {
					const idArray = idDept.getEveryIdArrayOfLayer(childrenLayer);
					if(idArray.length == 0) {
						UIDept.setupBtnShowOrHideByClassName(childrenLayer, "createFirstCard");
					};
				};
			} else {
				// 기존 카드가 있는 상태에서, 새 카드 만들기 후, 편집 취소를 할 때의 경우, 최신 lastest 카드를 보여주기
				// 기존 카드가 없는 경우에는 cancelEditCard 버튼이 나타나지 않음.
				const id = idDept.getLatestIdByLayer(layerHere);
				UIDept.showItOnUI(layerHere, id);
			};
		}
};

const removeCardDept = {
	"removeCard":
		function removeCard(layerHere) {
			const removeId = supportDept.getCardId(layerHere);
			if (confirm("정말 삭제하시겠습니까? 삭제가 완료되면, 해당 내용은 다시 복구될 수 없습니다.")) {
				removeCardDept.requestRemoveCard(layerHere, removeId);
			};
		},
	"requestRemoveCard":
		function requestRemoveCard(layerHere, idHere) {

			const inputId = idHere;
			const packagedData = objectById[inputId];
			packagedData.editedDate = supportDept.getTimeStamp();

			const idThreadObject = getIdThreadObjectByPackagedData(layerHere, packagedData);
		
			const switchedRef = switchDept.getRefBySwitchLayer(layerHere, idThreadObject);
			const idArrayLength = idDept.getEveryIdArrayOfLayer(layerHere).length;
		
			if(layerHere == "character" && idArrayLength == 1) {
				// character레이어에서 remove진행시, 
				// firebase의 bigPicture 자체가 사라져, 로딩 로직에서 버그가 남.
				// 그래서 예외 처리
				const emptyData = {children: ""};
				const switchedRefForEmptyData = switchedRef.parent;
				switchedRefForEmptyData.set(emptyData, (e) => {
					console.log("**remove completed = ", e);
					alert("삭제되었습니다.");
					});
			} else {
				switchedRef.child(inputId)
				.remove((e) => {
					LtoSDept.request_followupEditedDate(layerHere, packagedData, function(){
						alert("삭제되었습니다.");
					});
					console.log("**remove completed = ", e);
					});
			};
		}
};

const monitorDept = {
	"monitorCardBlankOrDuplicates":
		function monitorCardBlankOrDuplicates(layerHere) {
			const cardValue = document.getElementById(layerHere).value.trim();
			if (cardValue != "") {		
				const sameTextArray = monitorDept.getSameTextArray(layerHere, cardValue);
				if (sameTextArray == undefined) {
					return true;
				} else {
					UIDept.highLightBorder(layerHere, "red");
					alert("중복된 카드가 있습니다. 내용을 수정해주시기 바랍니다.");
				};
			} else {
				UIDept.highLightBorder(layerHere, "red");
				alert("카드가 비어있습니다. 내용을 입력해주시기 바랍니다.");
			};
			return false;
		},
	"getSameTextArray":
		function getSameTextArray(layerHere2, cardValueHere) {
			const idArray = idDept.getEveryIdArrayOfLayer(layerHere2);
			const mappedIdArray = idArray.map( id => {
				const mappingObject = {"id":id};
				mappingObject[layerHere2] = objectById[id].contents[layerHere2];	
				return mappingObject;
				});
			const valueArray = [];
			for(let i = 0; i < mappedIdArray.length; i++) {
				valueArray.push(mappedIdArray[i][layerHere2]);
			};
			const sameTextArray = monitorDept.filterSameTextArray(cardValueHere, valueArray);
			return sameTextArray;
		},
	"filterSameTextArray":
		function filterSameTextArray(query, valueArray) {
			return valueArray.find(value => query == value);
		}
};

const supportDept = {
	"getTimeStamp":
		function getTimeStamp() {
			const now = new Date();
			const nowString = now.toISOString();
			return nowString;
		},
	"getCardId":
		function getCardId(layerHere) {
			const cardElementId = "cardId_"+layerHere;
			const result = document.getElementById(cardElementId).value;
			return result;
		},
	"getLayerByEventListener":
		function getLayerByEventListener() {
			const inputButtonSelector = document.getElementsByTagName("input");
			for (let i = 0; i < inputButtonSelector.length; i++) {
				inputButtonSelector[i].addEventListener("click", function (e) {
					eventListenerResult = "";
					returnClassName = e.target.parentNode.parentNode.className;
					eventListenerResult = returnClassName;
				});
			};
		}
};

const idDept = {
	// **idDept에서는 필요한 id값을 가져온다.
	// **id 값은 대표적으로 parentsId, idTread로 해당한다.
	"getLatestIdByLayer": 
		function getLatestIdByLayer(layerHere) {
			const eachIdArrayByLayer = idDept.getEveryIdArrayOfLayer(layerHere);
			if(eachIdArrayByLayer.length > 0){
				const latestId = idDept.getLastestEditedId(eachIdArrayByLayer);
				return latestId;
			} else {
				return null;
			};
		},
	"getLastestEditedId":
		function getLastestEditedId(keysArrayHere) {
			const mappedArray = keysArrayHere.map( id => {
				const c = objectById[id];
				return {"id": id, "editedDate": c.editedDate};
			}).sort(
				(a,b) => new Date(b.editedDate) - new Date(a.editedDate)
			);
			if (mappedArray != null) {
				const latestEditedId = mappedArray[0];
				return latestEditedId.id;
			} else {
				return null;
			};
		},
	"getParentsIdfromChildId":
		function getParentsIdfromChildId(childLayerHere, childIdHere) {
			console.log("**=====idDept.getParentsIdfromChildId start=====");

			const isNewIdResult = idDept.isNewId(childIdHere);
			
			if(childLayerHere != "character" && !isNewIdResult) {
				const everyIdArray = Object.keys(objectById);
				for(let i = 0; i < everyIdArray.length; i++) {
					if(everyIdArray[i] == childIdHere) {
						return objectById[childIdHere].parentsId;
					};
				};
			} else {
				return null;
			};

		},
	"getEveryIdArrayOfLayer":
		function getEveryIdArrayOfLayer(layerHere) {
			const everyIdArray = Object.keys(objectById);
			const everyIdArrayOfLayer = [];
			for(let i = 0; i < everyIdArray.length; i++) {
				if(objectById[everyIdArray[i]].layer == layerHere ) {
					everyIdArrayOfLayer.push(everyIdArray[i]);
				};
			};
			// character 레이어를 제외하고, 부모에 해당하는 것들 중에서만 중복을 검토하기
			if(layerHere != "character") {
				const everyIdArrayOfLayerFromSameParents = [];
				for(let j = 0; j < everyIdArrayOfLayer.length; j++) {
					const parentsLayer = switchDept.getParentsLayerBySwitchLayer(layerHere);
					if (objectById[everyIdArrayOfLayer[j]].parentsId == supportDept.getCardId(parentsLayer)){
						everyIdArrayOfLayerFromSameParents.push(everyIdArrayOfLayer[j]);
					};
				};
				return everyIdArrayOfLayerFromSameParents;
			};
			return everyIdArrayOfLayer;
		},
	"getEveryIdArrayOfLayerById":
		function getEveryIdArrayOfLayerById(layerHere, idHere) {
			const everyIdArray = Object.keys(objectById);
			const everyIdArrayOfLayer = [];
			for(let i = 0; i < everyIdArray.length; i++) {
				if(objectById[everyIdArray[i]].layer == layerHere ) {
					everyIdArrayOfLayer.push(everyIdArray[i]);
				};
			};
			// character 레이어를 제외하고, 부모에 해당하는 것들 중에서만 중복을 검토하기
			if(layerHere != "character") {
				const everyIdArrayOfLayerFromSameParents = [];
				for(let j = 0; j < everyIdArrayOfLayer.length; j++) {
					if (objectById[everyIdArrayOfLayer[j]].parentsId == idDept.getParentsIdfromChildId(layerHere, idHere)){
						everyIdArrayOfLayerFromSameParents.push(everyIdArrayOfLayer[j]);
					};
				};
				return everyIdArrayOfLayerFromSameParents;
			};
			return everyIdArrayOfLayer;
		},
	"isNewId":
		function isNewId(idHere) {
			const everyIdArray = Object.keys(objectById);
			const checkpoint = everyIdArray.includes(idHere);
			if (checkpoint) {
				return false;
			} else {
				return true;
			};
		},
	"getIdThreadObjectByPackagedData":
		function getIdThreadObjectByPackagedData(layerHere, packagedDataHere) {
			const idThreadObject = {};

			switch(layerHere) {
				case "character" :
					// 해당 없음
					break;
				case "direction" :
					idThreadObject.characterId = packagedDataHere.parentsId;
					break;
				case "roadmap" :
					const directionId = packagedDataHere.parentsId;
					idThreadObject.directionId = directionId;
					idThreadObject.characterId = idDept.getParentsIdfromChildId("direction", directionId);
					break;
				case "actionPlan" :
					const roadmapId = packagedDataHere.parentsId;
					const directionId2 = idDept.getParentsIdfromChildId("roadmap", roadmapId);
					idThreadObject.roadmapId = roadmapId;
					idThreadObject.directionId = directionId2;
					idThreadObject.characterId = idDept.getParentsIdfromChildId("direction", directionId2);
					break;
				default : null;
			};
			return idThreadObject;
		}
} 

const switchDept = {
	"getRefBySwitchLayer":
		function getRefBySwitchLayer(layerHere, idThreadObjectHere) {
			console.log("**=====getRefBySwitchLayer() start=====");
			
			const parentsLayer = switchDept.getParentsLayerBySwitchLayer(layerHere);
			const parentsId = idThreadObjectHere[parentsLayer+"Id"];

			const userRef = db.ref("users").child(userData.uid);
			const bigPictureRef = userRef.child("bigPicture");
			const characterRef = bigPictureRef.child("children");

			switch(layerHere){
				case "character" :
					return characterRef;
				case "direction" : 
					const characterId = parentsId;

					const directionRef = characterRef.child(characterId).child("children");
					return directionRef;

				case "roadmap" : 
					const directionId = parentsId;
					const characterId2 = idDept.getParentsIdfromChildId("direction", directionId);

					const directionRef2 = characterRef.child(characterId2).child("children");
					const roadmapRef = directionRef2.child(directionId).child("children");
					return roadmapRef;

				case "actionPlan" : 
					const roadmapId = parentsId;
					const directionId2 = idDept.getParentsIdfromChildId("roadmap", roadmapId);
					const characterId3 = idDept.getParentsIdfromChildId("direction", directionId2);

					const directionRef3 = characterRef.child(characterId3).child("children");
					const roadmapRef2 = directionRef3.child(directionId2).child("children");
					const actionPlanRef = roadmapRef2.child(roadmapId).child("children");
					return actionPlanRef;

				default: 
					return null;
			};
		},
	"getIdThreadObjectById":
		function getIdThreadObjectById(layerHere, inputIdhere) {
			const returnObject = {};
			switch(layerHere){
				case "character" : 
					returnObject["characterId"] = inputIdhere;
					returnObject["directionId"] = "";
					returnObject["roadmapId"] = "";
					returnObject["actionPlanId"] = "";
					break;
				case "direction" :
					returnObject["characterId"] = idDept.getParentsIdfromChildId("direction", inputIdhere);
					returnObject["directionId"] = inputIdhere;
					returnObject["roadmapId"] = "";
					returnObject["actionPlanId"] = "";
					break;
				case "roadmap" :
					const directionId = idDept.getParentsIdfromChildId("roadmap", inputIdhere);
					const characterId = idDept.getParentsIdfromChildId("direction", directionId);
					returnObject["characterId"] = characterId;
					returnObject["directionId"] = directionId;
					returnObject["roadmapId"] = inputIdhere;
					returnObject["actionPlanId"] = "";
					break;
				case "actionPlan" :
					const roadmapId = idDept.getParentsIdfromChildId("actionPlan", inputIdhere);
					const direcitonId2 = idDept.getParentsIdfromChildId("roadmap", roadmapId);
					const characterId2 = idDept.getParentsIdfromChildId("direction", direcitonId2);
					returnObject["characterId"] = characterId2;
					returnObject["directionId"] = direcitonId2;
					returnObject["roadmapId"] = roadmapId;
					returnObject["actionPlanId"] = inputIdhere;
					break;
				default: null;	
			};
			return returnObject;
		},
	"getParentsLayerBySwitchLayer":
		function getParentsLayerBySwitchLayer(layerHere) {
			switch(layerHere){
				case "character" : 
					return null;
				case "direction" :
					return "character";
				case "roadmap" :
					return "direction";
				case "actionPlan" :
					return "roadmap";
				default : return null; 
			};
		},
	"getChildrenLayerBySwitchLayer":
		function getChildrenLayerBySwitchLayer(layerHere) {
			switch(layerHere){
				case "character" : 
					return "direction";
				case "direction" :
					return "roadmap";
				case "roadmap" :
					return "actionPlan";
				case "actionPlan" :
					return null;
				default : return null; 
			};
		}
};


