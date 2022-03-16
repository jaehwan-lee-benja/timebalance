const firebase = appFireBase;
const auth = firebase.auth();
const db = firebase.database();
const usersRef = db.ref("users");
const selectboxDate = document.getElementById("selectboxDate");
const selectboxTitle = document.getElementById("selectboxTitle");
// [질문] 아래 user를 const로 해도 되는가? currentUser값이 바뀌니 let으로 해야할것 같다.

let user = auth.currentUser;
let uid = null;
let userInfoData = {};
let bpData = {};
let bpDateList = {};
let bpTitleList = {};
let currentBpData = {};

// --------------------------
//teaxarea 자동크기
//출처: https://stackoverflow.com/questions/454202/creating-a-textarea-with-auto-resize
// --------------------------

const tx = document.getElementsByTagName("textarea");
for (let i = 0; i < tx.length; i++) {
	tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
	tx[i].addEventListener("input", OnInput, false);
};

function OnInput() {
	this.style.height = "auto";
	this.style.height = (this.scrollHeight) + "px";
};

// --------------------------
// start - 로그인/로그아웃, 로컬 오브젝트 생성 하기
// 로그인 참고 링크: https://www.youtube.com/watch?v=CvkCjfHts9A&list=PLxCXGTk-TOK9NieH8hhON952KPmIfNSqk&index=15
// --------------------------

(function () {

	auth.onAuthStateChanged(function (user) {

		if (user != null) {

			// let user = auth.currentUser;
			let uid = user.uid;
			const userRef = db.ref("users/" + uid);

			userRef.on("value", (snapshot) => {
				// console.log("value = ", value);
				//[질문] "value"가 무엇인지 모르겠다. 문법 요소를 찾으려고하는데, 나오지 않는다.

				snapshot.forEach(childSnap => {

					let key = childSnap.key;
					let value = childSnap.val();

					if(key == "bigPicture") {

						//bpData 오브젝트 만들기
						let bigPictures = value
						let bpIds = Object.keys(bigPictures)
						bpIds.forEach( bpId => {
							let bigPicture = bigPictures[bpId];
							let bpTitle = bigPicture.bpTitle
							bpData[bpTitle] = bigPicture;
							bpData[bpTitle]["bpId"] = bpId;
						});

					}else{

						//userInfoData 오브젝트 만들기
						value["uid"] = childSnap.key;
						userInfoData[key] = value;
					};

				});

				console.log("bpData = ", bpData);

				// createBpTitleList();
				let bpTitleList = Object.keys(bpData);
				console.log("bpTitleList = ", bpTitleList)

				// createSelectBoxTitle();
				// SelectboxTitle 초기화하기
				// 참고 링크: https://stackoverflow.com/questions/42365845/how-to-refresh-select-box-without-reloading-the-whole-form-in-js
				for (let i = selectboxTitle.options.length - 1; i >= 0; i--) {
					selectboxTitle.remove(i + 1);
				}

				// seletBox에 <option> 만들어서, date값 넣기
				for (let i = 0; i < bpTitleList.length; i++) {
					let option = document.createElement("OPTION"),
						txt = document.createTextNode(bpTitleList[i]);
					option.appendChild(txt);
					option.setAttribute("value", bpTitleList[i]);
					selectboxTitle.insertBefore(option, selectboxTitle.lastChild);
				};

				// bpDateList가 0인지 확인하기
				if(bpTitleList.length > 0) {
					// selectLatestDate();
					let lastestTitle = bpTitleList[bpTitleList.length - 1];

					// lastestDate로 currentBpData만들기
					for (let key in bpData) {
						if(key == lastestTitle){
							let bpDataSet = bpData[key]
							for (let key in bpDataSet) {
								currentBpData[key] = bpDataSet[key];
							};
						};
					};

					printbpData();
					stateHandler("readPaper");

				} else {
					stateHandler("createFirstPaper");
				};
				
				printUserInfo();
			});
		} else {
			// redirect to login page.
			let uid = null;
			window.location.replace("login.html");
		};
	});
})();

function logOut() {
	firebase.auth().signOut();
};

function stateHandler(state){

	//모든 버튼 가리기
	document.getElementById("openEditPaper_btn").style.display = "none";
	document.getElementById("cancelEditPaper_btn").style.display = "none";
	document.getElementById("saveEditedPaper_btn").style.display = "none";
	document.getElementById("saveNewPaper_btn").style.display = "none";
	document.getElementById("removePaper_btn").style.display = "none";
	document.getElementById("openNewPaper_btn").style.display = "none";
	
	if (state == "createFirstPaper") {
		document.getElementById("guideMessage").innerHTML = "'파란색으로 쓰여진 곳의 네모칸에 내용을 작성해보세요~!'"
		document.getElementById("saveNewPaper_btn").style.display = "initial";
		//document.getElementById("saveNewPaper_btn").style.backgroundColor = "#9CC0E7";
		pageModeHandler("editing");
	} else {
		if (state == "openNewPaper") {
			document.getElementById("saveNewPaper_btn").style.display = "initial";
			document.getElementById("cancelEditPaper_btn").style.display = "initial";
			pageModeHandler("editing");
		} else {
			if (state == "readPaper") {
				document.getElementById("openEditPaper_btn").style.display = "initial";
				document.getElementById("openNewPaper_btn").style.display = "initial";
				document.getElementById("removePaper_btn").style.display = "initial";
				pageModeHandler("reading");
			} else {
				if (state == "editPaper") {
					document.getElementById("saveEditedPaper_btn").style.display = "initial";
					document.getElementById("cancelEditPaper_btn").style.display = "initial";
					document.getElementById("saveNewPaper_btn").style.display = "initial";
					document.getElementById("removePaper_btn").style.display = "initial";
					pageModeHandler("editing");
				} else {
					let state = null;
				};
			};
		};
	};
	console.log("state = ", state);
};

function printUserInfo() {

	let userName = userInfoData.name;
	let userEmail = userInfoData.email;
	document.getElementById("nameChecked").innerHTML = "생각 설계자: " + userName + " 대표"
	document.getElementById("emailChecked").innerHTML = "(" + userEmail + ")"

};

function printbpData(){

	let dateChecked = currentBpData.editedDate

	document.getElementById("dateChecked").innerHTML = dateChecked;
	document.getElementById("bpTitle").innerHTML = currentBpData.bpTitle;
	document.getElementById("direction").innerHTML = currentBpData.contents.direction;
	document.getElementById("naviA").innerHTML = currentBpData.contents.naviA;
	document.getElementById("naviB").innerHTML = currentBpData.contents.naviB;
	document.getElementById("actionPlan").innerHTML = currentBpData.contents.actionPlan;

	pageModeHandler("reading");

};

// [질문] back에서의 object와 내부에서의 오브젝트
// console.log("currentBpData @back = ", currentBpData);

// function loadCurrentData() {

// 	console.log("--start loadCurrentData()--");

// 	selectLatestDate();

// 	let checkedDate = document.getElementById("dateChecked").value;
// 	console.log("checkedDate =", checkedDate);
//  -> checekdDate 바탕으로 CurrentData 오브젝트 만들기
// 	console.log("--end loadCurrentData()--");
// };

// --------------------------
//	selectBox 목록 만들기 
//  참고: https://www.youtube.com/watch?v=HMehtL39VUQ
// --------------------------

// [질문] createBpDateList를 함수로 써서, 거기서 값을 가져오는 것은 안되는가?
// function createBpDateList() {
// 	let bpDateList = Object.keys(bpData);
// 	console.log("bpDateList @createBpDateList = ", bpDateList);
// };

// function createSelectboxDate(){

// 	console.log("--start createSelectboxDate()--");

// 	console.log("bpDateList @createSelectboxDate = ", bpDateList);

// 	// selectboxDate 초기화하기
// 	// 참고 링크: https://stackoverflow.com/questions/42365845/how-to-refresh-select-box-without-reloading-the-whole-form-in-js
// 	for (let i = selectboxDate.options.length - 1; i >= 0; i--) {
// 		selectboxDate.remove(i + 1);
// 	}

// 	// seletBox에 <option> 만들어서, date값 넣기
// 	for (let i = 0; i < bpDateList.length; i++) {
// 		let option = document.createElement("OPTION"),
// 			txt = document.createTextNode(bpDateList[i]);
// 		option.appendChild(txt);
// 		option.setAttribute("value", bpDateList[i]);
// 		selectboxDate.insertBefore(option, selectboxDate.lastChild);
// 	}

// 	console.log("--end createSelectboxDate()--");

// };

// function selectLatestDate(){

// 	console.log("--start selectLatestDate()--");

// 	let lastestDate = bpDateList[bpDateList.length - 1]
// 	console.log("최근저장된일자=", lastestDate);
// 	document.getElementById("dateChecked").innerHTML = lastestDate;

// 	console.log("--end selectLatestDate()--");
// };

//[향후 개선하기] 더블클릭시 작성모드로 설정되기
//[버그] direction에 있는 textarea만 선택이 되고 있음
// const card = document.querySelector("textarea");

// card.addEventListener("dblclick", function (e) {
// 	openEditPaper();
// });

function pageModeHandler(pageMode) {
	if (pageMode == "editing") {
		document.getElementById("divPaperMode").innerHTML = "작성모드";
		document.getElementById("gridMainFrame").style.color = "#9CC0E7";
		document.getElementById("bpTitle").readOnly = false;
		document.getElementById("direction").readOnly = false;
		document.getElementById("naviA").readOnly = false;
		document.getElementById("naviB").readOnly = false;
		document.getElementById("actionPlan").readOnly = false;
		document.getElementById("divPaperInfo").style.display = "none";
	} else {
		document.getElementById("divPaperMode").innerHTML = "읽기모드";
		document.getElementById("gridMainFrame").style.color = "#424242";
		document.getElementById("bpTitle").readOnly = true;
		document.getElementById("direction").readOnly = true;
		document.getElementById("naviA").readOnly = true;
		document.getElementById("naviB").readOnly = true;
		document.getElementById("actionPlan").readOnly = true;
	};
	//console.log("pageMode = ", pageMode)
};

function selectDate() {

	let selectedDateValue = selectboxDate.value;
	let selectedBpData = bpData[selectedDateValue];

	document.getElementById("dateChecked").innerHTML = selectedBpData.editedDate;
	document.getElementById("bpTitle").value = selectedBpData.bpTitle;
	document.getElementById("direction").value = selectedBpData.contents.direction;
	document.getElementById("naviA").value = selectedBpData.contents.naviA;
	document.getElementById("naviB").value = selectedBpData.contents.naviB;
	document.getElementById("actionPlan").value = selectedBpData.contents.actionPlan;

	stateHandler("readPaper");

};

function setMainBp() {
	// 새로 작성중인 코드(220316)

	// 1. 서버로부터 bpId 읽어오기
	// 2. bpId = currentBpId 매칭하기
	// 3. 매칭이 되면, setMainBp = "main"으로 설정하기
	// 4. 다른 setMainBp 중 "main"이 있던게 있다면, null로 바꾸기
	// 5. 새로고침하기

	// 1. 서버로부터 bpId 읽어오기

	// [질문] 아래의 let, const도 반복이 된다, 글로벌 스콥에서 작동되게 할 수 있을까?
	let currentUid = userInfoData.uid;
	let currentBpId = currentBpData.bpId;
	const bpRef = db.ref("users/" + currentUid + "/bigPicture/" + currentBpId + "/");

	bpRef.on("value", (snapshot) => {

		snapshot.forEach(childSnap => {

			let key = childSnap.key;
			let value = childSnap.val();

			if(key == "bigPicture") {

				//bpData 오브젝트 만들기
				let bigPictures = value
				let bpIds = Object.keys(bigPictures)
				bpIds.forEach( bpId => {
					let bigPicture = bigPictures[bpId];
					let bpTitle = bigPicture.bpTitle
					bpData[bpTitle] = bigPicture;
					bpData[bpTitle]["bpId"] = bpId;
				});

			}else{

				//userInfoData 오브젝트 만들기
				value["uid"] = childSnap.key;
				userInfoData[key] = value;
			};

		});
	});

	// 팝업으로 확인도 진행한다.
	// 완료되면 리딩모드로 진행된다.
	// 처음 페이지 로드시에는 그럼 메인페이퍼 셋팅 된것으로 체크된다.
	// 페이퍼정보 화면에서도 '메인페이퍼로 설정되어있음'을 표시한다.
	// 페이퍼이름 옆에 '별표'를 붙여서 리스트 중 어떤 것이 메인인지도 볼 수 있게한다.
};

function selectTitle() {

	let selectedTitleValue = selectboxTitle.value;
	let selectedBpData = bpData[selectedTitleValue];

	document.getElementById("dateChecked").innerHTML = selectedBpData.editedDate;
	document.getElementById("bpTitle").value = selectedBpData.bpTitle;
	document.getElementById("direction").value = selectedBpData.contents.direction;
	document.getElementById("naviA").value = selectedBpData.contents.naviA;
	document.getElementById("naviB").value = selectedBpData.contents.naviB;
	document.getElementById("actionPlan").value = selectedBpData.contents.actionPlan;

	stateHandler("readPaper");

};

function openNewPaper() {

	stateHandler("openNewPaper");

	//[질문] 이부분이 반복되는데 함수로 할 수 있는 방법이 있을까?
	let today = new Date();
	let todayValue = today.toLocaleString();

	document.getElementById("dateChecked").innerHTML = todayValue;
	document.getElementById("bpTitle").value = "";
	document.getElementById("direction").value = "";
	document.getElementById("naviA").value = "";
	document.getElementById("naviB").value = "";
	document.getElementById("actionPlan").value = "";

	pageModeHandler("editing");

};

function openEditPaper() {

	stateHandler("editPaper");

};

function cancelEditPaper() {

	stateHandler("readPaper");
	location.reload();

};

function saveEditedPaper() {
	
	let updatedBpData = {
		contents: {}
	};

	let today = new Date();
	let todayValue = today.toLocaleString()

	updatedBpData["editedDate"] = todayValue;
	updatedBpData["bpTitle"] = document.getElementById("bpTitle").value;
	updatedBpData.contents["direction"] = document.getElementById("direction").value;
	updatedBpData.contents["naviA"] = document.getElementById("naviA").value;
	updatedBpData.contents["naviB"] = document.getElementById("naviB").value;
	updatedBpData.contents["actionPlan"] = document.getElementById("actionPlan").value;

	let currentUid = userInfoData.uid;
	let currentbpId = currentBpData.bpId;
	const bpRef = db.ref("users/" + currentUid + "/bigPicture/" + currentbpId + "/");

	bpRef.update(updatedBpData, (e) => {
		console.log("update completed = ", e);
	});

	stateHandler("readPaper");
	alert("저장되었습니다.");
	location.reload();

};

function removePaper() {

	let currentUid = userInfoData.uid;
	let currentBpId = currentBpData.bpId;
	const bpRef = db.ref("users/" + currentUid + "/bigPicture/" + currentBpId + "/");

	if (confirm("정말 삭제하시겠습니까?")) {
		bpRef.remove();
		alert("삭제되었습니다.");
		location.reload();
	};

	stateHandler("readPaper");

};

function saveNewPaper() {

	let newBpData = {
		contents: {}
	};

	let today = new Date();
	let todayValue = today.toLocaleString();

	newBpData["createdDate"] = todayValue;
	newBpData["editedDate"] = todayValue;
	newBpData["bpTitle"] = document.getElementById("bpTitle").value;
	newBpData.contents["direction"] = document.getElementById("direction").value;
	newBpData.contents["naviA"] = document.getElementById("naviA").value;
	newBpData.contents["naviB"] = document.getElementById("naviB").value;
	newBpData.contents["actionPlan"] = document.getElementById("actionPlan").value;

	const usersRef = db.ref("users");
	let currentUid = userInfoData.uid;

	usersRef.child(currentUid + "/bigPicture/")
		.push(newBpData);

	stateHandler("readPaper");
	alert("저장되었습니다.");
	location.reload();

};

function darkmode() {
	let selectorBody = document.querySelector("body")
	let selectorDarkMode = document.getElementById("darkMode")
	let selectorGridIndex = document.getElementById("gridIndex")
	let selectordivContentsControl = document.getElementById("divContentsControl")
	if (selectorDarkMode.value === "다크모드 켜기") {
		selectorBody.style.backgroundColor = "#1E1E1E";
		selectorBody.style.color = "white";
		selectorDarkMode.value = "다크모드 끄기";

		let alist = document.querySelectorAll("a");
		let i = 0;
		while (i < alist.length) {
			alist[i].style.color = "powderblue";
			i = i + 1;
		}

		selectorGridIndex.style.backgroundColor = "#333333";
		selectordivContentsControl.style.backgroundColor = "#333333";

	} else {
		selectorBody.style.backgroundColor = "white";
		selectorBody.style.color = "black";
		selectorDarkMode.value = "다크모드 켜기";

		let alist = document.querySelectorAll("a");
		let i = 0;
		while (i < alist.length) {
			alist[i].style.color = "blue";
			i = i + 1;
		}

		selectorGridIndex.style.backgroundColor = "rgb(240, 240, 240)";
		selectordivContentsControl.style.backgroundColor = "rgb(240, 240, 240)";

	}
};