/* Loaded last: replace legacy ORST renderers while leaving other learning modules intact. */
renderORSTWelcome=function(){orstPaint.stage=1;orstPaint.draft=orstLoadDraft();return renderORSTPainted()};
renderORST=function(){orstPaint.draft??=orstLoadDraft();return renderORSTPainted()};
beginORSTTrial=function(){if(navigationBusy)return false;orstGoStage(2);return true};
positionORSTWelcome=function(){return positionORSTPainted()};
startORSTSpell=function(){if(navigationBusy)return false;activeModule='orst';return transition('orst-welcome',()=>renderORSTWelcome())};
renderORSTGradeSelection=function(){return orstGoStage(2)};
