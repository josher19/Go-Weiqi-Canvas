CG = {}

CG.COMPOSITEOP="source-over,source-in,source-out,source-atop,destination-over,destination-in,destination-out,destination-atop,lighter,copy,xor".split(",")

CG.COMPOSITEOP.forEach(function(item,ndx, it) { var name=item.replace("source-", "SRC_").replace("destination-", "DEST_"); it[name.toUpperCase()]=item; })

CG.OPTIONS={}

CG.OPTIONS['globalCompositeOperation']=CG.COMPOSITEOP;

CG.c2d = document.getElementsByTagName('canvas')[0].getContext('2d');

CG.get = function(a) { return CG.c2d[a]; }
CG.set = function(a,v) { return CG.c2d[a]=v; }
CG.options = function(a) { return CG.OPTIONS[a]; }

CG.OPTIONS['lineCap'] = "butt,round,square".split(",")
CG.OPTIONS['lineJoin'] = "round,bevel,miter".split(",")
CG.OPTIONS['textBaseline']="top, hanging, middle, alphabetic, ideographic, bottom".split(", ")
