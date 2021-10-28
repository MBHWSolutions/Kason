var RadTreeView_KeyboardHooked=false;
var RadTreeView_Active=null;
var RadTreeView_DragActive=null;
var RadTreeView_MouseMoveHooked=false;
var RadTreeView_MouseUpHooked=false;
var RadTreeView_MouseY=0;
var RadTreeViewGlobalFirstParam=null;
var RadTreeViewGlobalSecondParam=null;
var RadTreeViewGlobalThirdParam=null;
var RadTreeViewGlobalFourthParam=null;
var contextMenuToBeHidden=null;
var safariKeyDownFlag=true;
if(typeof (window.RadControlsNamespace)=="undefined"){
window.RadControlsNamespace=new Object();
}
RadControlsNamespace.AppendStyleSheet=function(_1,_2,_3){
if(!_3){
return;
}
if(!_1){
document.write("<"+"link"+" rel='stylesheet' type='text/css' href='"+_3+"' />");
}else{
var _4=document.createElement("LINK");
_4.rel="stylesheet";
_4.type="text/css";
_4.href=_3;
document.getElementById(_2+"StyleSheetHolder").appendChild(_4);
}
};
function RadTreeNode(){
this.Parent=null;
this.TreeView=null;
this.Nodes=new Array();
this.ID=null;
this.ClientID=null;
this.SignImage=null;
this.SignImageExpanded=null;
this.Image=0;
this.ImageExpanded=0;
this.Action=null;
this.Index=0;
this.Level=0;
this.Text=null;
this.Value=null;
this.Category=null;
this.NodeCss=null;
this.NodeCssOver=null;
this.NodeCssSelect=null;
this.ContextMenuName=null;
this.Enabled=true;
this.Expanded=false;
this.Checked=false;
this.Selected=false;
this.DragEnabled=1;
this.DropEnabled=1;
this.EditEnabled=1;
this.ExpandOnServer=0;
this.IsClientNode=0;
this.Attributes=new Array();
this.IsFetchingData=false;
this.CachedText="";
}
RadTreeNode.prototype.ScrollIntoView=function(){
var _5=document.getElementById(this.TreeView.Container);
var _6=this.TextElement().parentNode.offsetHeight;
this.KeepInView();
_5.scrollTop=_5.scrollTop+_5.clientHeight-_6;
};
RadTreeNode.prototype.Next=function(){
var _7=(this.Parent!=null)?this.Parent.Nodes:this.TreeView.Nodes;
return (this.Index>=_7.length)?null:_7[this.Index+1];
};
RadTreeNode.prototype.Prev=function(){
var _8=(this.Parent!=null)?this.Parent.Nodes:this.TreeView.Nodes;
return (this.Index<=0)?null:_8[this.Index-1];
};
RadTreeNode.prototype.NextVisible=function(){
if(this.Expanded&&this.Nodes.length>0){
return this.Nodes[0];
}
if(this.Next()!=null){
return this.Next();
}
var _9=this;
while(_9.Parent!=null){
if(_9.Parent.Next()!=null){
return _9.Parent.Next();
}
_9=_9.Parent;
}
return null;
};
RadTreeNode.prototype.LastVisibleChild=function(_a){
var _b=_a.Nodes;
var _c=_b.length;
var _d=_b[_c-1];
var _e=_d;
if(_d.Expanded&&_d.Nodes.length>0){
_e=this.LastVisibleChild(_d);
}
return _e;
};
RadTreeNode.prototype.PrevVisible=function(){
var _f=this.Prev();
if(_f!=null){
if(_f.Expanded&&_f.Nodes.length>0){
return this.LastVisibleChild(_f);
}
return this.Prev();
}
if(this.Parent!=null){
return this.Parent;
}
return null;
};
RadTreeNode.prototype.Toggle=function(){
if(this.Enabled){
if(this.TreeView.FireEvent(this.TreeView.BeforeClientToggle,this)==false){
return;
}
(this.Expanded)?this.Collapse():this.Expand();
if(this.ExpandOnServer!=2){
this.TreeView.FireEvent(this.TreeView.AfterClientToggle,this);
}
}
};
RadTreeNode.prototype.CollapseNonParentNodes=function(){
for(var i=0;i<this.TreeView.AllNodes.length;i++){
if(this.TreeView.AllNodes[i].Expanded&&!this.IsParent(this.TreeView.AllNodes[i])){
this.TreeView.AllNodes[i].CollapseNoEffect();
}
}
};
RadTreeNode.prototype.EncodeURI=function(s){
try{
return encodeURIComponent(s);
}
catch(e){
return escape(s);
}
};
RadTreeNode.prototype.RaiseNoTreeViewOnServer=function(){
throw new Error("No RadTreeView instance has been created on the server.\n"+"Make sure that you have the control instance created.\n"+"Please review this article for additional information.");
};
RadTreeNode.prototype.GetTheElement=function(){
var _12=this.TextElement();
while(_12&&_12.tagName.toLowerCase()!="div"){
_12=_12.parentNode;
}
return _12;
};
RadTreeNode.prototype.FetchDataOnDemand=function(){
if(this.Checked==1){
this.Checked=true;
}
var url=this.TreeView.LoadOnDemandUrl+"&rtnClientID="+this.ClientID+"&rtnLevel="+this.Level+"&rtnID="+this.ID+"&rtnParentPosition="+this.GetParentPositions()+"&rtnText="+this.EncodeURI(this.Text)+"&rtnValue="+this.EncodeURI(this.Value)+"&rtnCategory="+this.EncodeURI(this.Category)+"&rtnChecked="+this.Checked;
var _14=this.TreeView;
_14.AfterClientCallBackError=this.TreeView.AfterClientCallBackError;
var _15;
if(typeof (XMLHttpRequest)!="undefined"){
_15=new XMLHttpRequest();
}else{
_15=new ActiveXObject("Microsoft.XMLHTTP");
}
url=url+"&timeStamp="+encodeURIComponent((new Date()).getTime());
_15.open("GET",url,true);
_15.setRequestHeader("Content-Type","application/json; charset=utf-8");
var _16=this;
_15.onreadystatechange=function(){
if(_15.readyState!=4){
return;
}
var _17=_15.responseText;
if(_15.status==500){
_14.FireEvent(_14.AfterClientCallBackError,_14);
alert("RadTreeView: Server error in the NodeExpand event handler, press ok to view the result.");
document.body.innerHTML=_17;
return;
}
var _18=_17.indexOf(",");
var _19=parseInt(_17.substring(0,_18));
var _1a=_17.substring(_18+1,_19+_18+1);
var _1b=_17.substring(_19+_18+1);
_16.LoadNodesOnDemand(_1a,_15.status,url);
_16.ImageOn();
_16.SignOn();
_16.Expanded=true;
_16.ExpandOnServer=0;
var _1c=_16.GetTheElement();
var _1d=_1c.parentNode;
switch(_16.TreeView.LoadingMessagePosition){
case 0:
case 1:
if(_16.TextElement().parentNode.tagName=="A"){
_16.TextElement().parentNode.firstChild.innerHTML=_16.CachedText;
_1d=_1c;
}else{
_1d=_16.TextElement().parentNode;
if(_16.TextElement().innerText){
_16.TextElement().innerHTML=_16.CachedText;
}else{
_16.TextElement().innerHTML=_16.CachedText;
}
}
break;
case 2:
_1c.removeChild(document.getElementById(_16.ClientID+"Loading"));
_1d=_1c;
break;
case 3:
_1d=_1c;
}
if(_16.Nodes.length>0){
rtvInsertHTML(_1d,_1b);
var _1e=_1d.getElementsByTagName("IMG");
for(var i=0;i<_1e.length;i++){
RadTreeView.AlignImage(_1e[i]);
}
var _20=_1d.getElementsByTagName("INPUT");
for(var i=0;i<_20.length;i++){
RadTreeView.AlignImage(_20[i]);
}
}
_16.IsFetchingData=false;
_16.TreeView.FireEvent(_16.TreeView.AfterClientToggle,_16);
};
_15.send(null);
};
RadTreeNode.prototype.Expand=function(){
if(this.ExpandOnServer){
if(!this.TreeView.FireEvent(this.TreeView.BeforeClientToggle,this)){
return;
}
if(this.ExpandOnServer==1){
this.TreeView.PostBack("NodeExpand",this.ClientID);
return;
}
if(this.ExpandOnServer==2){
if(!this.IsFetchingData){
this.IsFetchingData=true;
this.CachedText=this.TextElement().innerHTML;
switch(this.TreeView.LoadingMessagePosition){
case 0:
this.TextElement().innerHTML="<span class="+this.TreeView.LoadingMessageCssClass+">"+this.TreeView.LoadingMessage+"</span> "+this.TextElement().innerHTML;
break;
case 1:
this.TextElement().innerHTML=this.TextElement().innerHTML+" "+"<span class="+this.TreeView.LoadingMessageCssClass+">"+this.TreeView.LoadingMessage+"</span> ";
break;
case 2:
rtvInsertHTML(this.TextElement().parentNode,"<div id="+this.ClientID+"Loading "+" class="+this.TreeView.LoadingMessageCssClass+">"+this.TreeView.LoadingMessage+"</div>");
break;
}
var _21=this;
window.setTimeout(function(){
_21.FetchDataOnDemand();
},20);
return;
}
}
}
if(!this.Nodes.length){
return;
}
if(this.TreeView.SingleExpandPath){
this.CollapseNonParentNodes();
}
var _22=document.getElementById("G"+this.ClientID);
if(this.TreeView.ExpandDelay>0){
_22.style.overflow="hidden";
_22.style.height="1px";
_22.style.display="block";
window.setTimeout("rtvNodeExpand(1,'"+_22.id+"',"+this.TreeView.ExpandDelay+");",20);
}else{
_22.style.display="block";
}
this.ImageOn();
this.SignOn();
this.Expanded=true;
if(!this.IsClientNode){
this.TreeView.UpdateExpandedState();
}
};
RadTreeNode.prototype.GetParentPositions=function(){
var _23=this;
var _24="";
while(_23!=null){
if(_23.Next()!=null){
_24=_24+"1";
}else{
_24=_24+"0";
}
_23=_23.Parent;
}
return _24;
};
RadTreeNode.prototype.Collapse=function(){
if(this.Nodes.length>0){
if(this.ExpandOnServer==1&&this.TreeView.NodeCollapseWired){
this.TreeView.PostBack("NodeCollapse",this.ClientID);
return;
}
if(this.TreeView.ExpandDelay>0){
var _25=document.getElementById("G"+this.ClientID);
if(_25.scrollHeight!="undefined"){
_25.style.overflow="hidden";
_25.style.display="block";
window.setTimeout("rtvNodeCollapse("+_25.scrollHeight+",'"+_25.id+"',"+this.TreeView.ExpandDelay+" );",20);
}else{
this.CollapseNoEffect();
}
}else{
this.CollapseNoEffect();
}
this.ImageOff();
this.SignOff();
this.Expanded=false;
this.TreeView.UpdateExpandedState();
}
};
RadTreeNode.prototype.CollapseNoEffect=function(){
if(this.Nodes.length>0){
var _26=document.getElementById("G"+this.ClientID);
_26.style.display="none";
this.ImageOff();
this.SignOff();
this.Expanded=false;
this.TreeView.UpdateExpandedState();
}
};
RadTreeNode.prototype.Highlight=function(e){
if(!this.Enabled){
return;
}
if(e){
if(this.TreeView.MultipleSelect&&(e.ctrlKey||e.shiftKey)){
if(this.Selected){
this.TextElement().className=this.NodeCss;
this.Selected=false;
if(this.TreeView.SelectedNode==this){
this.TreeView.SelectedNode=null;
}
this.TreeView.UpdateSelectedState();
return;
}
}else{
this.TreeView.UnSelectAllNodes();
}
}
this.TextElement().className=this.NodeCssSelect;
this.TreeView.SelectNode(this);
this.TreeView.FireEvent(this.TreeView.AfterClientHighlight,this);
};
RadTreeNode.prototype.ExecuteAction=function(e){
if(this.IsClientNode){
return;
}
if(this.TextElement().tagName=="A"){
this.TextElement().click();
}else{
if(this.Action){
this.TreeView.PostBack("NodeClick",this.ClientID);
}
}
if(e){
(document.all)?e.returnValue=false:e.preventDefault();
}
};
RadTreeNode.prototype.Select=function(e){
if(this.TreeView.FireEvent(this.TreeView.BeforeClientClick,this,e)==false){
e.returnValue=false;
if(e.preventDefault){
e.preventDefault();
}
return;
}
if(this.Enabled){
this.Highlight(e);
this.TreeView.LastHighlighted=this;
this.ExecuteAction();
}else{
(document.all)?e.returnValue=false:e.preventDefault();
}
this.TreeView.FireEvent(this.TreeView.AfterClientClick,this,e);
};
RadTreeNode.prototype.UnSelect=function(){
if(this.TextElement().parentNode&&this.TextElement().parentNode.tagName=="A"){
this.TextElement().parentNode.className=this.NodeCss;
}
this.TextElement().className=this.NodeCss;
this.Selected=false;
};
RadTreeNode.prototype.Disable=function(){
this.TextElement().className=this.TreeView.NodeCssDisable;
this.Enabled=false;
this.Selected=false;
if(this.CheckElement()!=null){
this.CheckElement().disabled=true;
}
};
RadTreeNode.prototype.Enable=function(){
this.TextElement().className=this.NodeCss;
this.Enabled=true;
if(this.CheckElement()!=null){
this.CheckElement().disabled=false;
}
};
RadTreeNode.prototype.Hover=function(e){
var _2b=(e.srcElement)?e.srcElement:e.target;
if(this.TreeView.IsRootNodeTag(_2b)){
this.TreeView.SetBorderOnDrag(this,_2b,e);
return;
}
if(this.Enabled){
if(this.TreeView.FireEvent(this.TreeView.BeforeClientHighlight,this)==false){
return;
}
this.TreeView.LastHighlighted=this;
if(RadTreeView_DragActive!=null&&RadTreeView_DragActive.DragClone!=null&&(!this.Expanded)&&this.ExpandOnServer!=1){
var _2c=this;
window.setTimeout(function(){
_2c.ExpandOnDrag();
},1000);
}
if(!this.Selected){
this.TextElement().className=this.NodeCssOver;
if(this.Image){
this.ImageElement().style.cursor="hand";
}
}
this.TreeView.FireEvent(this.TreeView.AfterClientHighlight,this);
}
};
RadTreeNode.prototype.UnHover=function(e){
var _2e=(e.srcElement)?e.srcElement:e.target;
if(this.TreeView.IsRootNodeTag(_2e)){
this.TreeView.ClearBorderOnDrag(_2e);
return;
}
if(this.Enabled){
this.TreeView.LastHighlighted=null;
if(!this.Selected){
this.TextElement().className=this.NodeCss;
if(this.Image){
this.ImageElement().style.cursor="default";
}
}
this.TreeView.FireEvent(this.TreeView.AfterClientMouseOut,this);
}
};
RadTreeNode.prototype.ExpandOnDrag=function(){
if(RadTreeView_DragActive!=null&&RadTreeView_DragActive.DragClone!=null&&(!this.Expanded)){
if(RadTreeView_Active.LastHighlighted==this){
this.Expand();
}
}
};
RadTreeNode.prototype.CheckBoxClick=function(e){
if(this.Enabled){
if(this.TreeView.FireEvent(this.TreeView.BeforeClientCheck,this,e)==false){
(this.Checked)?this.Check():this.UnCheck();
return;
}
(this.Checked)?this.UnCheck():this.Check();
if(this.TreeView.AutoPostBackOnCheck){
this.TreeView.PostBack("NodeCheck",this.ClientID);
this.TreeView.FireEvent(this.TreeView.AfterClientCheck,this);
return;
}
this.TreeView.FireEvent(this.TreeView.AfterClientCheck,this);
}
};
RadTreeNode.prototype.Check=function(){
if(this.CheckElement()!=null){
this.CheckElement().checked=true;
this.Checked=true;
this.TreeView.UpdateCheckedState();
}
};
RadTreeNode.prototype.UnCheck=function(){
if(this.CheckElement()!=null){
this.CheckElement().checked=false;
this.Checked=false;
this.TreeView.UpdateCheckedState();
}
};
RadTreeNode.prototype.IsSet=function(a){
return (a!=null&&a!="");
};
RadTreeNode.prototype.ImageOn=function(){
var _31=document.getElementById(this.ClientID+"i");
if(this.ImageExpanded!=0){
_31.src=this.ImageExpanded;
}
};
RadTreeNode.prototype.ImageOff=function(){
var _32=document.getElementById(this.ClientID+"i");
if(this.Image!=0){
_32.src=this.Image;
}
};
RadTreeNode.prototype.SignOn=function(){
var _33=document.getElementById(this.ClientID+"c");
if(this.IsSet(this.SignImageExpanded)){
_33.src=this.SignImageExpanded;
}
};
RadTreeNode.prototype.SignOff=function(){
var _34=document.getElementById(this.ClientID+"c");
if(this.IsSet(this.SignImage)){
_34.src=this.SignImage;
}
};
RadTreeNode.prototype.TextElement=function(){
var _35=document.getElementById(this.ClientID);
var _36=_35.getElementsByTagName("span")[0];
if(_36==null){
_36=_35.getElementsByTagName("a")[0];
}
return _36;
};
RadTreeNode.prototype.ImageElement=function(){
return document.getElementById(this.ClientID+"i");
};
RadTreeNode.prototype.CheckElement=function(){
return document.getElementById(this.ClientID).getElementsByTagName("input")[0];
};
RadTreeNode.prototype.IsParent=function(_37){
var _38=this.Parent;
while(_38!=null){
if(_37==_38){
return true;
}
_38=_38.Parent;
}
return false;
};
RadTreeNode.prototype.StartEdit=function(){
if(this.EditEnabled){
var _39=this.Text;
this.TreeView.EditMode=true;
var _3a=this.TextElement().parentNode;
this.TreeView.EditTextElement=this.TextElement().cloneNode(true);
this.TextElement().parentNode.removeChild(this.TextElement());
var _3b=this;
var _3c=document.createElement("input");
_3c.setAttribute("type","text");
_3c.setAttribute("size",this.Text.length+3);
_3c.setAttribute("value",_39);
_3c.className=this.TreeView.NodeCssEdit;
var _3d=this;
_3c.onblur=function(){
_3d.EndEdit();
};
_3c.onchange=function(){
_3d.EndEdit();
};
_3c.onkeypress=function(e){
_3d.AnalyzeEditKeypress(e);
};
_3c.onsubmit=function(){
return false;
};
_3a.appendChild(_3c);
this.TreeView.EditInputElement=_3c;
_3c.focus();
_3c.onselectstart=function(e){
if(!e){
e=window.event;
}
if(e.stopPropagation){
e.stopPropagation();
}else{
e.cancelBubble=true;
}
};
var _40=0;
var _41=this.Text.length;
if(_3c.createTextRange){
var _42=_3c.createTextRange();
_42.moveStart("character",_40);
_42.moveEnd("character",_41);
_42.select();
}else{
_3c.setSelectionRange(_40,_41);
}
}
};
RadTreeNode.prototype.EndEdit=function(){
this.TreeView.EditInputElement.onblur=null;
this.TreeView.EditInputElement.onchange=null;
var _43=this.TreeView.EditInputElement.parentNode;
this.TreeView.EditInputElement.parentNode.removeChild(this.TreeView.EditInputElement);
_43.appendChild(this.TreeView.EditTextElement);
if(this.TreeView.FireEvent(this.TreeView.AfterClientEdit,this,this.Text,this.TreeView.EditInputElement.value)!=false){
if(this.Text!=this.TreeView.EditInputElement.value){
var _44=this.ClientID+":"+this.TreeView.EscapeParameter(this.TreeView.EditInputElement.value);
this.TreeView.PostBack("NodeEdit",_44);
return;
}
}
this.TreeView.EditMode=false;
this.TreeView.EditInputElement=null;
this.TreeView.EditTextElement=null;
};
RadTreeNode.prototype.AnalyzeEditKeypress=function(e){
if(document.all){
e=event;
}
if(e.keyCode==13){
(document.all)?e.returnValue=false:e.preventDefault();
if(typeof (e.cancelBubble)!="undefined"){
e.cancelBubble=true;
}
this.EndEdit();
return false;
}
if(e.keyCode==27){
this.TreeView.EditInputElement.value=this.TreeView.EditTextElement.innerHTML;
this.EndEdit();
}
return true;
};
RadTreeNode.prototype.LoadNodesOnDemand=function(s,_47,url){
if(_47==404){
var _49="CallBack URL not found: \n\r\n\r"+url+"\n\r\n\rAre you using URL Rewriter? Please, try setting the AjaxUrl property to match the correct URL you need";
alert(_49);
this.TreeView.FireEvent(this.TreeView.AfterClientCallBackError,this.TreeView);
}else{
try{
eval(s);
var _4a=window[this.ClientID+"ClientData"];
for(var i=0;i<_4a.length;i++){
var _4c=_4a[i][0];
var _4d=_4c.substring(0,_4c.lastIndexOf("_t"));
var _4e=this.TreeView.FindNode(_4d);
if(_4e){
this.TreeView.LoadNode(_4a[i],null,_4e);
}else{
_4a[i][17]=0;
this.TreeView.LoadNode(_4a[i],null,this);
}
}
}
catch(e){
this.TreeView.FireEvent(this.TreeView.AfterClientCallBackError,this.TreeView);
}
}
};
function RadTreeView(_4f){
if(window.tlrkTreeViews==null){
window.tlrkTreeViews=new Array();
}
if(window.tlrkTreeViews[_4f]!=null){
var _50=window.tlrkTreeViews[_4f];
_50.Dispose();
}
tlrkTreeViews[_4f]=this;
this.Nodes=new Array();
this.AllNodes=new Array();
this.ClientID=null;
this.SelectedNode=null;
this.DragMode=false;
this.DragSource=null;
this.DragClone=null;
this.LastHighlighted=null;
this.MouseInside=false;
this.HtmlElementID="";
this.EditMode=false;
this.EditTextElement=null;
this.EditInputElement=null;
this.BeforeClientClick=null;
this.BeforeClientHighlight=null;
this.AfterClientHighlight=null;
this.AfterClientMouseOut=null;
this.BeforeClientDrop=null;
this.AfterClientDrop=null;
this.BeforeClientToggle=null;
this.AfterClientToggle=null;
this.BeforeClientContextClick=null;
this.BeforeClientContextMenu=null;
this.AfterClientContextClick=null;
this.BeforeClientCheck=null;
this.AfterClientCheck=null;
this.AfterClientMove=null;
this.AfterClientFocus=null;
this.BeforeClientDrag=null;
this.AfterClientEdit=null;
this.AfterClientClick=null;
this.BeforeClientDoubleClick=null;
this.AfterClientCallBackError=null;
this.DragAndDropBetweenNodes=false;
this.AutoPostBackOnCheck=false;
this.CausesValidation=true;
this.ContextMenuVisible=false;
this.ContextMenuName=null;
this.ContextMenuNode=null;
this.SingleExpandPath=false;
this.ExpandDelay=2;
this.TabIndex=0;
this.AllowNodeEditing=false;
this.LoadOnDemandUrl=null;
this.LoadingMessage="(loading ...)";
this.LoadingMessagePosition=0;
this.LoadingMessageCssClass="LoadingMessage";
this.NodeCollapseWired=false;
this.RightToLeft=false;
this.LastBorderElementSet=null;
this.LastDragPosition="on";
this.LastDragNode=null;
this.IsBuilt=false;
}
RadTreeView.AlignImage=function(_51){
_51.align="absmiddle";
_51.style.display="inline";
if(!document.all||window.opera){
if(_51.nextSibling&&_51.nextSibling.tagName=="SPAN"){
_51.nextSibling.style.verticalAlign="middle";
}
if(_51.nextSibling&&_51.nextSibling.tagName=="INPUT"){
_51.nextSibling.style.verticalAlign="middle";
}
}
};
RadTreeView.prototype.OnInit=function(){
var _52=new Array();
this.PreloadImages(_52);
GlobalTreeViewImageList=_52;
var _53=document.getElementById(this.Container).getElementsByTagName("IMG");
for(var i=0;i<_53.length;i++){
var _55=_53[i].className;
if(_52[_55]&&_55!=null&&_55!=""){
_53[i].src=_52[_55];
RadTreeView.AlignImage(_53[i]);
}
}
this.LoadTree(_52);
var _56=document.getElementById(this.Container).getElementsByTagName("INPUT");
for(var i=0;i<_56.length;i++){
RadTreeView.AlignImage(_56[i]);
}
var _57=this;
this.OnKeyDownMozilla=function(e){
_57.KeyDownMozilla(e);
};
if(document.addEventListener&&(!RadTreeView_KeyboardHooked)){
RadTreeView_KeyboardHooked=true;
this.AttachEvent(document,"keydown",this.OnKeyDownMozilla);
}
if((!RadTreeView_MouseMoveHooked)&&(this.DragAndDrop)){
RadTreeView_MouseMoveHooked=true;
this.AttachEvent(document,"mousemove",rtvMouseMove);
}
if(!RadTreeView_MouseUpHooked){
RadTreeView_MouseUpHooked=true;
this.AttachEvent(document,"mouseup",rtvMouseUp);
}
this.AttachAllEvents();
this.IsBuilt=true;
};
RadTreeView.prototype.AttachAllEvents=function(){
var _59=this;
var _5a=document.getElementById(this.Container);
this.OnFocus=function(e){
rtvDispatcher(_59.ClientID,"focus",e);
};
this.OnMouseOver=function(e){
rtvDispatcher(_59.ClientID,"mover",e);
};
this.OnMouseOut=function(e){
rtvDispatcher(_59.ClientID,"mout",e);
};
this.OnContextMenu=function(e){
rtvDispatcher(_59.ClientID,"context",e);
};
this.OnScroll=function(e){
_59.Scroll();
};
this.OnClick=function(e){
rtvDispatcher(_59.ClientID,"mclick",e);
};
this.OnDblClick=function(e){
rtvDispatcher(_59.ClientID,"mdclick",e);
};
this.OnKeyDown=function(e){
rtvDispatcher(_59.ClientID,"keydown",e);
};
this.OnSelectStart=function(e){
return false;
};
this.OnDragStart=function(e){
return false;
};
this.OnMouseDown=function(e){
rtvDispatcher(_59.ClientID,"mdown",e);
};
this.OnUnload=function(e){
_59.Dispose();
};
this.AttachEvent(_5a,"focus",this.OnFocus);
this.AttachEvent(_5a,"mouseover",this.OnMouseOver);
this.AttachEvent(_5a,"mouseout",this.OnMouseOut);
this.AttachEvent(_5a,"contextmenu",this.OnContextMenu);
this.AttachEvent(_5a,"scroll",this.OnScroll);
this.AttachEvent(_5a,"click",this.OnClick);
this.AttachEvent(_5a,"dblclick",this.OnDblClick);
this.AttachEvent(_5a,"keydown",this.OnKeyDown);
this.AttachEvent(_5a,"selectstart",this.OnSelectStart);
this.AttachEvent(_5a,"dragstart",this.OnDragStart);
if(this.DragAndDrop){
this.AttachEvent(_5a,"mousedown",this.OnMouseDown);
}
this.AttachEvent(window,"unload",this.OnUnload);
this.RootElement=_5a;
};
RadTreeView.prototype.Dispose=function(){
if(this.disposed){
return;
}
this.disposed=true;
this.DetachEvent(this.RootElement,"focus",this.OnFocus);
this.DetachEvent(this.RootElement,"mouseover",this.OnMouseOver);
this.DetachEvent(this.RootElement,"mouseout",this.OnMouseOut);
this.DetachEvent(this.RootElement,"contextmenu",this.OnContextMenu);
this.DetachEvent(this.RootElement,"scroll",this.OnScroll);
this.DetachEvent(this.RootElement,"click",this.OnClick);
this.DetachEvent(this.RootElement,"dblclick",this.OnDblClick);
this.DetachEvent(this.RootElement,"keydown",this.OnKeyDown);
this.DetachEvent(this.RootElement,"selectstart",this.OnSelectStart);
this.DetachEvent(this.RootElement,"dragstart",this.OnDragStart);
if(this.DragAndDrop){
this.DetachEvent(this.RootElement,"mousedown",this.OnMouseDown);
}
this.DetachEvent(window,"unload",this.OnUnload);
this.RootElement=null;
};
RadTreeView.prototype.PreloadImages=function(_67){
var _68=window[this.ClientID+"ImageData"];
for(var i=0;i<_68.length;i++){
_67[i]=_68[i];
}
};
RadTreeView.prototype.FindNode=function(_6a){
for(var i=0;i<this.AllNodes.length;i++){
if(this.AllNodes[i].ClientID==_6a){
return this.AllNodes[i];
}
}
return null;
};
RadTreeView.prototype.FindNodeByText=function(_6c){
for(var i=0;i<this.AllNodes.length;i++){
if(this.AllNodes[i].Text==_6c){
return this.AllNodes[i];
}
}
return null;
};
RadTreeView.prototype.FindNodeByValue=function(_6e){
for(var i=0;i<this.AllNodes.length;i++){
if(this.AllNodes[i].Value==_6e){
return this.AllNodes[i];
}
}
return null;
};
RadTreeView.prototype.FindNodeByAttribute=function(_70,_71){
for(var i=0;i<this.AllNodes.length;i++){
if(this.AllNodes[i].Attributes[_70]==_71){
return this.AllNodes[i];
}
}
return null;
};
RadTreeView.prototype.IsChildOf=function(_73,_74){
if(_74==_73){
return false;
}
while(_74&&(_74!=document.body)){
if(_74==_73){
return true;
}
try{
_74=_74.parentNode;
}
catch(e){
return false;
}
}
return false;
};
RadTreeView.prototype.GetOffsetTop=function(){
var _75=document.getElementById(this.Container);
var _76=_75.offsetTop;
var _77=_75.offsetParent;
while(_77){
_76+=_77.offsetTop;
_77=_77.offsetParent;
}
return _76;
};
RadTreeView.prototype.GetTarget=function(e){
if(!e){
return null;
}
return e.target||e.srcElement;
};
RadTreeView.prototype.LoadTree=function(_79){
var cd=window[this.ClientID+"ClientData"];
for(var i=0;i<cd.length;i++){
this.LoadNode(cd[i],_79);
}
};
RadTreeView.prototype.LoadNode=function(cd,_7d,_7e){
var _7f=new RadTreeNode();
_7f.ClientID=cd[0];
_7f.TreeView=this;
var _80=cd[17];
if(_80>0){
_7f.Parent=this.AllNodes[_80-1];
}
if(_7e!=null){
_7f.Parent=_7e;
}
_7f.NodeCss=this.NodeCss;
_7f.NodeCssOver=this.NodeCssOver;
_7f.NodeCssSelect=this.NodeCssSelect;
_7f.Text=cd[1];
_7f.Value=cd[2];
_7f.Category=cd[3];
if(_7d!=null){
_7f.SignImage=_7d[cd[4]];
_7f.SignImageExpanded=_7d[cd[5]];
}else{
_7f.SignImage=GlobalTreeViewImageList[cd[4]];
_7f.SignImageExpanded=GlobalTreeViewImageList[cd[5]];
}
if(cd[6]>0){
_7f.Image=_7d[cd[6]];
}
if(cd[7]>0){
_7f.ImageExpanded=_7d[cd[7]];
}
_7f.Selected=cd[8];
if(_7f.Selected){
this.SelectedNode=_7f;
}
_7f.Checked=cd[9];
_7f.Enabled=cd[10];
_7f.Expanded=cd[11];
_7f.Action=cd[12];
if(this.IsSet(cd[13])){
_7f.NodeCss=cd[13];
}
if(this.IsSet(cd[14])){
_7f.ContextMenuName=cd[14];
}
this.AllNodes[this.AllNodes.length]=_7f;
if(_7f.Parent!=null){
_7f.Parent.Nodes[_7f.Parent.Nodes.length]=_7f;
}else{
this.Nodes[this.Nodes.length]=_7f;
}
_7f.Index=cd[16];
_7f.DragEnabled=cd[18];
_7f.DropEnabled=cd[19];
_7f.ExpandOnServer=cd[20];
if(this.IsSet(cd[21])){
_7f.NodeCssOver=cd[21];
}
if(this.IsSet(cd[22])){
_7f.NodeCssSelect=cd[22];
}
_7f.Level=cd[23];
_7f.ID=cd[24];
_7f.IsClientNode=cd[25];
_7f.EditEnabled=cd[26];
_7f.Attributes=cd[27];
};
RadTreeView.prototype.Toggle=function(_81){
this.FindNode(_81).Toggle();
};
RadTreeView.prototype.Select=function(_82,e){
this.FindNode(_82).Select(e);
};
RadTreeView.prototype.Hover=function(_84,e){
var _84=this.FindNode(_84);
if(_84){
_84.Hover(e);
}
};
RadTreeView.prototype.UnHover=function(_86,e){
var _86=this.FindNode(_86);
if(_86){
_86.UnHover(e);
}
};
RadTreeView.prototype.CheckBoxClick=function(_88,e){
this.FindNode(_88).CheckBoxClick(e);
};
RadTreeView.prototype.Highlight=function(_8a,e){
this.FindNode(_8a).Highlight(e);
};
RadTreeView.prototype.SelectNode=function(_8c){
this.SelectedNode=_8c;
_8c.Selected=true;
this.UpdateSelectedState();
};
RadTreeView.prototype.GetSelectedNodes=function(){
var _8d=new Array();
for(var i=0;i<this.AllNodes.length;i++){
if(this.AllNodes[i].Selected){
_8d[_8d.length]=this.AllNodes[i];
}
}
return _8d;
};
RadTreeView.prototype.UnSelectAllNodes=function(_8f){
for(var i=0;i<this.AllNodes.length;i++){
if(this.AllNodes[i].Selected&&this.AllNodes[i].Enabled){
this.AllNodes[i].UnSelect();
}
}
};
RadTreeView.prototype.KeyDownMozilla=function(e){
var _92=RadTreeView_Active;
if(_92){
var _93=_92.GetTarget(e);
if(_93.tagName.toUpperCase()=="BODY"||_93.tagName.toUpperCase()=="HTML"||_92.IsChildOf(_93,_92.RootElement)||_93==_92.RootElement){
if(!_92.IsBuilt){
return;
}
var _94=_92.SelectedNode;
if(_94!=null){
if(_92.EditMode){
return;
}
if(e.keyCode==107||e.keyCode==109||e.keyCode==37||e.keyCode==39){
_94.Toggle();
(document.all)?e.returnValue=false:e.preventDefault();
}
if(e.keyCode==40&&_94.NextVisible()!=null){
_94.NextVisible().KeepInView();
_94.NextVisible().Highlight(e);
(document.all)?e.returnValue=false:e.preventDefault();
}
if(e.keyCode==38&&_94.PrevVisible()!=null){
_94.PrevVisible().KeepInView();
_94.PrevVisible().Highlight(e);
(document.all)?e.returnValue=false:e.preventDefault();
}
if(e.keyCode==13){
if(_92.FireEvent(_92.BeforeClientClick,_94,e)==false){
return;
}
_94.ExecuteAction();
_92.FireEvent(_92.AfterClientClick,_94,e);
}
if(e.keyCode==32){
_94.CheckBoxClick();
}
if(e.keyCode==113&&_92.AllowNodeEditing){
_94.StartEdit();
}
}else{
if(e.keyCode==38||e.keyCode==40||e.keyCode==13||e.keyCode==32){
_92.Nodes[0].Highlight();
_92.Nodes[0].KeepInView();
(document.all)?e.returnValue=false:e.preventDefault();
}
}
}
}
};
RadTreeNode.prototype.GetOffsetTop=function(){
var _95=this.TextElement().parentNode.offsetTop;
var _96=this.TextElement().parentNode.offsetParent;
while(_96){
_95+=_96.offsetTop;
_96=_96.offsetParent;
}
return _95;
};
RadTreeNode.prototype.KeepInView=function(){
var _97=this.TextElement();
var _98=document.getElementById(this.TreeView.Container);
var _99=this.GetOffsetTop();
var _9a=this.TreeView.GetOffsetTop();
var _9b=_99-_9a;
if(_9b<_98.scrollTop){
_98.scrollTop=_9b;
}
var _9c=this.TextElement().parentNode.offsetHeight;
if(_9b+_9c>(_98.clientHeight+_98.scrollTop)){
_98.scrollTop+=((_9b+_9c)-(_98.clientHeight+_98.scrollTop));
}
};
RadTreeView.prototype.KeyDown=function(e){
if(this.EditMode){
return;
}
var _9e=this.SelectedNode;
if(_9e!=null){
if(e.keyCode==107||e.keyCode==109||e.keyCode==37||e.keyCode==39){
_9e.Toggle();
}
if(e.keyCode==40&&_9e.NextVisible()!=null){
(document.all)?e.returnValue=false:e.preventDefault();
_9e.NextVisible().Highlight(e);
_9e.NextVisible().KeepInView();
}
if(e.keyCode==38&&_9e.PrevVisible()!=null){
(document.all)?e.returnValue=false:e.preventDefault();
_9e.PrevVisible().Highlight(e);
_9e.PrevVisible().KeepInView();
}
if(e.keyCode==13){
if(this.FireEvent(this.BeforeClientClick,this.SelectedNode,e)==false){
return;
}
_9e.ExecuteAction(e);
this.FireEvent(this.AfterClientClick,this.SelectedNode,e);
}
if(e.keyCode==32){
_9e.CheckBoxClick();
(document.all)?e.returnValue=false:e.preventDefault();
}
if(e.keyCode==113&&this.AllowNodeEditing){
_9e.StartEdit();
}
}else{
if(e.keyCode==38||e.keyCode==40||e.keyCode==13||e.keyCode==32){
this.Nodes[0].Highlight();
this.Nodes[0].KeepInView();
(document.all)?e.returnValue=false:e.preventDefault();
}
}
};
RadTreeView.prototype.UpdateState=function(){
this.UpdateExpandedState();
this.UpdateCheckedState();
this.UpdateSelectedState();
};
RadTreeView.prototype.UpdateExpandedState=function(){
var _9f="";
for(var i=0;i<this.AllNodes.length;i++){
var _a1=(this.AllNodes[i].Expanded)?"1":"0";
_9f+=_a1;
}
document.getElementById(this.ClientID+"_expanded").value=_9f;
};
RadTreeView.prototype.UpdateCheckedState=function(){
var _a2="";
for(var i=0;i<this.AllNodes.length;i++){
var _a4=(this.AllNodes[i].Checked)?"1":"0";
_a2+=_a4;
}
document.getElementById(this.ClientID+"_checked").value=_a2;
};
RadTreeView.prototype.UpdateSelectedState=function(){
var _a5="";
for(var i=0;i<this.AllNodes.length;i++){
var _a7=(this.AllNodes[i].Selected)?"1":"0";
_a5+=_a7;
}
document.getElementById(this.ClientID+"_selected").value=_a5;
};
RadTreeView.prototype.Scroll=function(){
for(var key in tlrkTreeViews){
if((typeof (tlrkTreeViews[key])!="function")&&tlrkTreeViews[key].ContextMenuVisible){
contextMenuToBeHidden=tlrkTreeViews[key];
window.setTimeout(function(){
if(contextMenuToBeHidden){
contextMenuToBeHidden.HideContextMenu();
}
},10);
}
}
document.getElementById(this.ClientID+"_scroll").value=document.getElementById(this.Container).scrollTop;
};
RadTreeView.prototype.ContextMenuClick=function(e,p1,p2,p3){
instance=this;
window.setTimeout(function(){
instance.HideContextMenu();
},10);
if(this.FireEvent(this.BeforeClientContextClick,this.ContextMenuNode,p1,p3)==false){
return;
}
if(p2){
var _ad=this.ContextMenuNode.ClientID+":"+this.EscapeParameter(p1)+":"+this.EscapeParameter(p3);
this.PostBack("ContextMenuClick",_ad);
}
};
RadTreeView.prototype.ContextMenu=function(e,_af){
var src=(e.srcElement)?e.srcElement:e.target;
var _b1=this.FindNode(_af);
if(_b1!=null&&this.BeforeClientContextMenu!=null){
var _b2=this.SelectedNode;
if(this.FireEvent(this.BeforeClientContextMenu,_b1,e,_b2)==false){
return;
}
this.Highlight(_af,e,_b2);
}
if(_b1!=null&&_b1.ContextMenuName!=null&&_b1.Enabled){
if(!this.ContextMenuVisible){
this.ContextMenuNode=_b1;
if(!_b1.Selected){
this.Highlight(_af,e);
}
this.ShowContextMenu(_b1.ContextMenuName,e);
document.all?e.returnValue=false:e.preventDefault();
}
}
};
RadTreeView.prototype.ShowContextMenu=function(_b3,e){
if(!document.readyState||document.readyState=="complete"){
var _b5="rtvcm"+this.ClientID+_b3;
var _b6=document.getElementById(_b5);
if(_b6){
var _b7=_b6.cloneNode(true);
_b7.id=_b5+"_clone";
document.body.appendChild(_b7);
_b7=document.getElementById(_b5+"_clone");
_b7.style.left=this.CalculateXPos(e)+"px";
_b7.style.top=this.CalculateYPos(e)+"px";
_b7.style.position="absolute";
_b7.style.display="block";
this.ContextMenuVisible=true;
this.ContextMenuName=_b3;
document.all?e.returnValue=false:e.preventDefault();
}
}
};
RadTreeView.prototype.CalculateYPos=function(e){
if(document.compatMode&&document.compatMode=="CSS1Compat"){
return (e.clientY+document.documentElement.scrollTop);
}
return (e.clientY+document.body.scrollTop);
};
RadTreeView.prototype.CalculateXPos=function(e){
if(navigator.appName=="Microsoft Internet Explorer"&&this.RightToLeft){
return (e.clientX-(document.documentElement.scrollWidth-document.documentElement.clientWidth-document.documentElement.scrollLeft));
}
if(document.compatMode&&document.compatMode=="CSS1Compat"){
return (e.clientX+document.documentElement.scrollLeft);
}
return (e.clientX+document.body.scrollLeft);
};
RadTreeView.prototype.HideContextMenu=function(){
if(!document.readyState||document.readyState=="complete"){
var _ba=document.getElementById("rtvcm"+this.ClientID+this.ContextMenuName+"_clone");
if(_ba){
document.body.removeChild(_ba);
}
this.ContextMenuVisible=false;
}
};
RadTreeView.prototype.MouseClickDispatcher=function(e){
var src=(e.srcElement)?e.srcElement:e.target;
var _bd=rtvGetNodeID(e);
if(_bd!=null&&src.tagName!="DIV"){
var _be=this.FindNode(_bd);
if(_be.Selected){
if(this.AllowNodeEditing){
_be.StartEdit();
return;
}else{
this.Select(_bd,e);
}
}else{
this.Select(_bd,e);
}
}
if(src.tagName=="IMG"){
var _bf=src.className;
if(this.IsSet(_bf)&&this.IsToggleImage(_bf)){
this.Toggle(src.parentNode.id);
}
}
if(src.tagName=="INPUT"&&rtvInsideNode(src)){
this.CheckBoxClick(src.parentNode.id,e);
}
};
RadTreeView.prototype.IsToggleImage=function(n){
return (n==1||n==2||n==5||n==6||n==7||n==8||n==10||n==11);
};
RadTreeView.prototype.DoubleClickDispatcher=function(e,_c2){
var _c3=this.FindNode(_c2);
if(this.FireEvent(this.BeforeClientDoubleClick,_c3)==false){
return;
}
this.Toggle(_c2);
};
RadTreeView.prototype.MouseOverDispatcher=function(e,_c5){
this.Hover(_c5,e);
};
RadTreeView.prototype.MouseOutDispatcher=function(e,_c7){
this.UnHover(_c7,e);
this.LastDragNode=null;
this.LastHighlighted=null;
};
RadTreeView.prototype.DetermineDirection=function(){
var _c8=document.getElementById(this.Container);
while(_c8){
if(_c8.dir){
this.RightToLeft=(_c8.dir.toLowerCase()=="rtl");
return;
}
_c8=_c8.parentNode;
}
this.RightToLeft=false;
};
RadTreeView.prototype.MouseDown=function(e){
if(this.LastHighlighted!=null&&this.DragAndDrop){
if(this.FireEvent(this.BeforeClientDrag,this.LastHighlighted)==false){
return;
}
if(!this.LastHighlighted.DragEnabled){
return;
}
if(e.button==2){
return;
}
this.DragSource=this.LastHighlighted;
this.DragClone=document.createElement("div");
document.body.appendChild(this.DragClone);
RadTreeView_DragActive=this;
var res="";
if(this.MultipleSelect&&(this.SelectedNodesCount()>1)){
for(var i=0;i<this.AllNodes.length;i++){
if(this.AllNodes[i].Selected){
if(this.AllNodes[i].Image){
var img=this.AllNodes[i].ImageElement();
var _cd=img.cloneNode(true);
this.DragClone.appendChild(_cd);
}
var _ce=this.AllNodes[i].TextElement().cloneNode(true);
_ce.className=this.AllNodes[i].NodeCss;
_ce.style.color="gray";
this.DragClone.appendChild(_ce);
this.DragClone.appendChild(document.createElement("BR"));
}
res=res+"text";
}
}
if(res==""){
if(this.LastHighlighted.Image){
var img=this.LastHighlighted.ImageElement();
var _cd=img.cloneNode(true);
this.DragClone.appendChild(_cd);
}
var _ce=this.LastHighlighted.TextElement().cloneNode(true);
_ce.className=this.LastHighlighted.NodeCss;
_ce.style.color="gray";
this.DragClone.appendChild(_ce);
}
this.DragClone.style.position="absolute";
this.DragClone.style.display="none";
if(e.preventDefault){
e.preventDefault();
}
}
};
RadTreeView.prototype.SelectedNodesCount=function(){
var _cf=0;
for(var i=0;i<this.AllNodes.length;i++){
if(this.AllNodes[i].Selected){
_cf++;
}
}
return _cf;
};
RadTreeView.prototype.FireEvent=function(_d1,a,b,c,d){
if(!_d1){
return true;
}
RadTreeViewGlobalFirstParam=a;
RadTreeViewGlobalSecondParam=b;
RadTreeViewGlobalThirdParam=c;
RadTreeViewGlobalFourthParam=d;
var s=_d1+"(RadTreeViewGlobalFirstParam, RadTreeViewGlobalSecondParam, RadTreeViewGlobalThirdParam, RadTreeViewGlobalFourthParam);";
return eval(s);
};
RadTreeView.prototype.Focus=function(e){
this.FireEvent(this.AfterClientFocus,this);
};
RadTreeView.prototype.IsSet=function(a){
return (a!=null&&a!="");
};
RadTreeView.prototype.GetX=function(obj){
var pos=this.GetElementPosition(obj);
return pos.x;
};
RadTreeView.prototype.GetY=function(obj){
var pos=this.GetElementPosition(obj);
return pos.y;
};
RadTreeView.prototype.GetElementPosition=function(el){
var _de=null;
var pos={x:0,y:0};
var box;
if(el.getBoundingClientRect){
box=el.getBoundingClientRect();
var _e1=document.documentElement.scrollTop||document.body.scrollTop;
var _e2=document.documentElement.scrollLeft||document.body.scrollLeft;
pos.x=box.left+_e2-2;
pos.y=box.top+_e1-2;
return pos;
}else{
if(document.getBoxObjectFor){
try{
box=document.getBoxObjectFor(el);
pos.x=box.x-2;
pos.y=box.y-2;
}
catch(e){
}
}else{
pos.x=el.offsetLeft;
pos.y=el.offsetTop;
_de=el.offsetParent;
if(_de!=el){
while(_de){
pos.x+=_de.offsetLeft;
pos.y+=_de.offsetTop;
_de=_de.offsetParent;
}
}
}
}
if(window.opera){
_de=el.offsetParent;
while(_de&&_de.tagName.toLowerCase()!="body"&&_de.tagName.toLowerCase()!="html"){
pos.x-=_de.scrollLeft;
pos.y-=_de.scrollTop;
_de=_de.offsetParent;
}
}else{
_de=el.parentNode;
while(_de&&_de.tagName.toLowerCase()!="body"&&_de.tagName.toLowerCase()!="html"){
pos.x-=_de.scrollLeft;
pos.y-=_de.scrollTop;
_de=_de.parentNode;
}
}
return pos;
};
RadTreeView.prototype.PostBack=function(_e3,_e4){
var _e5=_e3+"#"+_e4;
if(this.PostBackOptionsClientString){
var _e6=this.PostBackOptionsClientString.replace(/@@arguments@@/g,_e5);
if(typeof (WebForm_PostBackOptions)!="undefined"||_e6.indexOf("_doPostBack")>-1||_e6.indexOf("AsyncRequest")>-1||_e6.indexOf("AsyncRequest")>-1||_e6.indexOf("AjaxNS")>-1){
eval(_e6);
}
}else{
if(this.CausesValidation){
if(!(typeof (Page_ClientValidate)!="function"||Page_ClientValidate())){
return;
}
}
var _e7=this.PostBackFunction.replace(/@@arguments@@/g,_e5);
eval(_e7);
}
};
RadTreeView.prototype.EscapeParameter=function(_e8){
var _e9=_e8.replace(/'/g,"&squote");
_e9=_e9.replace(/\$/g,"&sdollar");
_e9=_e9.replace(/#/g,"&ssharp");
_e9=_e9.replace(/:/g,"&scolon");
_e9=_e9.replace(/\\/g,"\\\\");
return _e9;
};
RadTreeView.prototype.IsRootNodeTag=function(_ea){
if(_ea&&_ea.tagName=="DIV"&&_ea.id.indexOf(this.ID)>-1){
return true;
}
return false;
};
RadTreeView.prototype.SetBorderOnDrag=function(_eb,_ec,e){
if(this.DragAndDropBetweenNodes&&this.IsDragActive()){
this.LastDragNode=_eb;
var _ee=this.CalculateYPos(e);
var _ef=this.GetY(_ec);
if(_ee<_ef+_eb.TextElement().offsetHeight){
_ec.style.borderTop="1px dotted black";
this.LastDragPosition="above";
}else{
_ec.style.borderBottom="1px dotted black";
this.LastDragPosition="below";
}
this.LastBorderElementSet=_ec;
}
};
RadTreeView.prototype.ClearBorderOnDrag=function(_f0){
if(_f0&&this.DragAndDropBetweenNodes&&this.IsDragActive()){
_f0.style.borderTop="0px none black";
_f0.style.borderBottom="0px none black";
this.LastDragPosition="over";
}
};
RadTreeView.prototype.AttachEvent=function(_f1,_f2,_f3){
if(_f1.attachEvent){
_f1.attachEvent("on"+_f2,_f3);
}else{
if(_f1.addEventListener){
_f1.addEventListener(_f2,_f3,false);
}
}
};
RadTreeView.prototype.DetachEvent=function(_f4,_f5,_f6){
if(_f4.detachEvent){
_f4.detachEvent("on"+_f5,_f6);
}else{
if(_f4.removeEventListener){
_f4.removeEventListener(_f5,_f6,false);
}
}
};
RadTreeView.prototype.IsDragActive=function(){
for(var key in tlrkTreeViews){
if((typeof (tlrkTreeViews[key])!="function")&&tlrkTreeViews[key].DragClone!=null){
return true;
}
}
return false;
};
RadTreeView.prototype.GetScrollBarWidth=function(){
try{
if(typeof (this.scrollbarWidth)=="undefined"){
var _f8,_f9=0;
var _fa=document.createElement("div");
_fa.style.position="absolute";
_fa.style.top="-1000px";
_fa.style.left="-1000px";
_fa.style.width="100px";
_fa.style.overflow="auto";
var _fb=document.createElement("div");
_fb.style.width="1000px";
_fa.appendChild(_fb);
document.body.appendChild(_fa);
_f8=_fa.offsetWidth;
_f9=_fa.clientWidth;
document.body.removeChild(document.body.lastChild);
this.scrollbarWidth=_f8-_f9;
if(this.scrollbarWidth<=0||_f9==0){
this.scrollbarWidth=16;
}
}
return this.scrollbarWidth;
}
catch(error){
return false;
}
};
function rtvIsAnyContextMenuVisible(){
for(var key in tlrkTreeViews){
if((typeof (tlrkTreeViews[key])!="function")&&tlrkTreeViews[key].ContextMenuVisible){
return true;
}
}
return false;
}
function rtvAdjustScroll(){
if(RadTreeView_DragActive==null||RadTreeView_DragActive.DragClone==null||RadTreeView_Active==null){
return;
}
var _fd=RadTreeView_Active;
var _fe=document.getElementById(RadTreeView_Active.Container);
if(_fe){
var _ff,_100;
_ff=_fd.GetY(_fe);
_100=_ff+_fe.offsetHeight;
if((RadTreeView_MouseY-_ff)<50&&_fe.scrollTop>0){
_fe.scrollTop=_fe.scrollTop-10;
_fd.Scroll();
RadTreeView_ScrollTimeout=window.setTimeout(function(){
rtvAdjustScroll();
},100);
}else{
if((_100-RadTreeView_MouseY)<50&&_fe.scrollTop<(_fe.scrollHeight-_fe.offsetHeight+16)){
_fe.scrollTop=_fe.scrollTop+10;
_fd.Scroll();
RadTreeView_ScrollTimeout=window.setTimeout(function(){
rtvAdjustScroll();
},100);
}
}
}
}
function rtvMouseUp(e){
if(RadTreeView_Active==null){
return;
}
if(e&&!e.ctrlKey){
for(var key in tlrkTreeViews){
if((typeof (tlrkTreeViews[key])!="function")&&tlrkTreeViews[key].ContextMenuVisible){
contextMenuToBeHidden=tlrkTreeViews[key];
window.setTimeout(function(){
if(contextMenuToBeHidden){
contextMenuToBeHidden.HideContextMenu();
}
},10);
return;
}
}
}
if(RadTreeView_DragActive==null||RadTreeView_DragActive.DragClone==null){
return;
}
(document.all)?e.returnValue=false:e.preventDefault();
var _103=RadTreeView_DragActive.DragSource;
var _104=RadTreeView_Active.LastHighlighted;
var _105=RadTreeView_Active;
var _106="over";
var _107;
if(_105.LastBorderElementSet){
_106=_105.LastDragPosition;
_107=_105.LastDragNode;
_105.ClearBorderOnDrag(_105.LastBorderElementSet);
}
if(_107){
_104=_107;
}
document.body.removeChild(RadTreeView_DragActive.DragClone);
RadTreeView_DragActive.DragClone=null;
if(_104!=null&&_104.DropEnabled==false){
return;
}
if(_103==_104){
return;
}
if(RadTreeView_DragActive.FireEvent(RadTreeView_DragActive.BeforeClientDrop,_103,_104,e,_106)==false){
return;
}
if(_103.IsClientNode||((_104!=null)&&_104.IsClientNode)){
return;
}
var _108=RadTreeView_DragActive.ClientID+"#"+_103.ClientID+"#";
var _109="";
if(_104==null){
_109="null"+"#"+RadTreeView_DragActive.HtmlElementID;
}else{
_109=_105.ClientID+"#"+_104.ClientID+"#"+_106;
}
if(_104==null&&RadTreeView_DragActive.HtmlElementID==""){
return;
}
var _10a=_108+_109;
RadTreeView_DragActive.PostBack("NodeDrop",_10a);
RadTreeView_DragActive.FireEvent(RadTreeView_DragActive.AfterClientDrop,_103,_104,e);
RadTreeView_DragActive=null;
}
function rtvMouseMove(e){
if(rtvIsAnyContextMenuVisible()){
return;
}
if(RadTreeView_DragActive!=null&&RadTreeView_DragActive.DragClone!=null){
var newX,newY;
RadTreeView_DragActive.DetermineDirection();
if(!RadTreeView_DragActive.RightToLeft){
newX=RadTreeView_DragActive.CalculateXPos(e)+8;
newY=RadTreeView_DragActive.CalculateYPos(e)+4;
}else{
newX=RadTreeView_DragActive.CalculateXPos(e)-RadTreeView_DragActive.DragClone.clientWidth-8;
if((document.body.dir.toLowerCase()=="rtl"||document.dir.toLowerCase()=="rtl")&&document.all&&!window.opera){
newX-=RadTreeView_DragActive.GetScrollBarWidth();
}
newY=RadTreeView_DragActive.CalculateYPos(e)+4;
}
RadTreeView_MouseY=newY;
rtvAdjustScroll();
RadTreeView_DragActive.DragClone.style.zIndex=999;
RadTreeView_DragActive.DragClone.style.top=newY+"px";
RadTreeView_DragActive.DragClone.style.left=newX+"px";
RadTreeView_DragActive.DragClone.style.display="block";
RadTreeView_DragActive.FireEvent(RadTreeView_DragActive.AfterClientMove,e);
}
}
function rtvNodeExpand(a,id,_110){
var _111=document.getElementById(id);
var _112=_111.scrollHeight;
var step=(_112-a)/_110;
var _114=a+step;
if(_114>_112-1){
_111.style.height="";
_111.style.overflow="visible";
}else{
_111.style.height=_114+"px";
window.setTimeout("rtvNodeExpand("+_114+","+"'"+id+"',"+_110+");",5);
}
}
function rtvNodeCollapse(a,id,_117){
var _118=document.getElementById(id);
var _119=_118.scrollHeight;
var step=(_119-Math.abs(_119-a))/_117;
var _11b=a-step;
if(_11b<=3){
_118.style.overflow="visible";
_118.style.height="";
_118.style.display="none";
}else{
_118.style.height=_11b+"px";
window.setTimeout("rtvNodeCollapse("+_11b+","+"'"+id+"',"+_117+" );",5);
}
}
function rtvGetNodeID(e){
if(RadTreeView_Active==null){
return;
}
var _11d=(e.srcElement)?e.srcElement:e.target;
if(_11d.nodeType==3){
_11d=_11d.parentNode;
}
if(_11d.tagName=="IMG"&&_11d.nextSibling){
var _11e=_11d.className;
if(_11e){
_11e=parseInt(_11e);
if(_11e>12){
_11d=_11d.nextSibling;
}
}
}
if(_11d.id==RadTreeView_Active.ID){
return null;
}
if(_11d.id.indexOf(RadTreeView_Active.ID)>-1&&_11d.tagName=="DIV"){
return _11d.id;
}
while(_11d!=null){
if((_11d.tagName=="SPAN"||_11d.tagName=="A")&&rtvInsideNode(_11d)){
return _11d.parentNode.id;
}
_11d=_11d.parentNode;
}
return null;
}
function rtvInsideNode(_11f){
if(_11f.parentNode&&_11f.parentNode.tagName=="DIV"&&_11f.parentNode.id.indexOf(RadTreeView_Active.ID)>-1){
return _11f.parentNode.id;
}
}
function rtvDispatcher(t,w,e,p1,p2,p3){
if(!e){
e=window.event;
}
if(tlrkTreeViews){
var _126=rtvGetNodeID(e);
var _127=tlrkTreeViews[t];
if(!_127.IsBuilt){
return;
}
if(rtvIsAnyContextMenuVisible()&&w!="mclick"&&w!="cclick"){
return;
}
if(_127.EditMode){
return;
}
RadTreeView_Active=_127;
var _128=window.netscape&&!window.opera;
var _129=(navigator.userAgent.toLowerCase().indexOf("safari")!=-1);
switch(w){
case "mover":
if(_126!=null){
_127.MouseOverDispatcher(e,_126);
}
break;
case "mout":
if(_126!=null){
_127.MouseOutDispatcher(e,_126);
}
break;
case "mclick":
_127.MouseClickDispatcher(e);
break;
case "mdclick":
if(_126!=null){
_127.DoubleClickDispatcher(e,_126);
}
break;
case "mdown":
_127.MouseDown(e);
break;
case "mup":
_127.MouseUp(e);
break;
case "context":
if(_126!=null){
_127.ContextMenu(e,_126);
return false;
}
break;
case "cclick":
_127.ContextMenuClick(e,p1,p2,p3);
break;
case "focus":
_127.Focus(e);
case "keydown":
if(!_128&&!_129){
_127.KeyDown(e);
}
}
}
}
function rtvAppendStyleSheet(_12a,_12b){
var _12c=(navigator.appName=="Microsoft Internet Explorer")&&((navigator.userAgent.toLowerCase().indexOf("mac")!=-1)||(navigator.appVersion.toLowerCase().indexOf("mac")!=-1));
var _12d=(navigator.userAgent.toLowerCase().indexOf("safari")!=-1);
if(_12c||_12d){
document.write("<"+"link"+" rel='stylesheet' type='text/css' href='"+_12b+"'>");
}else{
var _12e=document.createElement("LINK");
_12e.rel="stylesheet";
_12e.type="text/css";
_12e.href=_12b;
document.getElementById(_12a+"StyleSheetHolder").appendChild(_12e);
}
}
function rtvInsertHTML(_12f,html){
if(_12f.tagName=="A"){
_12f=_12f.parentNode;
}
if(document.all){
_12f.insertAdjacentHTML("beforeEnd",html);
}else{
var r=_12f.ownerDocument.createRange();
r.setStartBefore(_12f);
var _132=r.createContextualFragment(html);
_12f.appendChild(_132);
}
}

