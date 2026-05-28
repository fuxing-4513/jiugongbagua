'use client'

import { useState } from 'react'
import { Solar, Lunar } from 'lunar-typescript'

const YEAR_W: Record<string,number> = {
  '甲子':1.2,'乙丑':0.9,'丙寅':0.6,'丁卯':0.7,'戊辰':1.2,'己巳':0.5,'庚午':0.9,'辛未':0.8,'壬申':0.7,'癸酉':0.8,
  '甲戌':1.5,'乙亥':0.9,'丙子':1.6,'丁丑':0.8,'戊寅':0.8,'己卯':1.9,'庚辰':1.2,'辛巳':0.6,'壬午':0.8,'癸未':0.7,
  '甲申':0.5,'乙酉':1.5,'丙戌':0.6,'丁亥':1.6,'戊子':1.5,'己丑':0.7,'庚寅':0.9,'辛卯':1.2,'壬辰':1.0,'癸巳':0.7,
  '甲午':1.5,'乙未':0.6,'丙申':0.5,'丁酉':1.4,'戊戌':1.4,'己亥':0.9,'庚子':0.7,'辛丑':0.7,'壬寅':0.9,'癸卯':1.2,
  '甲辰':0.8,'乙巳':0.7,'丙午':1.3,'丁未':0.5,'戊申':1.4,'己酉':0.5,'庚戌':0.9,'辛亥':1.7,'壬子':0.5,'癸丑':0.7,
  '甲寅':1.2,'乙卯':0.8,'丙辰':0.8,'丁巳':0.6,'戊午':1.9,'己未':0.6,'庚申':0.8,'辛酉':1.6,'壬戌':1.0,'癸亥':0.7,
}
const MONTH_W = [0,0.6,0.7,1.8,0.9,0.5,1.6,0.9,1.5,1.8,0.8,0.9,0.5]
const DAY_W: Record<number,number> = {1:0.5,2:1.0,3:0.8,4:1.5,5:1.6,6:1.5,7:0.8,8:1.6,9:0.6,10:0.6,11:0.9,12:0.9,13:0.8,14:0.9,15:1.0,16:0.8,17:0.9,18:1.8,19:0.5,20:1.5,21:1.0,22:0.9,23:0.8,24:0.9,25:1.5,26:1.8,27:0.7,28:0.8,29:1.6,30:0.6}
const HOUR_DZ = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']
const HOUR_RANGES = [[23,1],[1,3],[3,5],[5,7],[7,9],[9,11],[11,13],[13,15],[15,17],[17,19],[19,21],[21,23]]
const HOUR_W = [1.6,0.6,0.7,1.0,0.9,1.6,1.0,0.8,0.8,0.9,0.6,0.6]

interface Fortune { poem: string; interpret: string; level: string }

// ── 男命断语 ──
const MALE: Record<string,Fortune> = {
  '2.1':{poem:'短命非业谓大空，平生灾难事重重；凶祸频临陷逆境，终世困苦事不成。',interpret:'命途多舛，一生奔波劳碌却难有所成。宜放宽心态，多行善事积德，不可好高骛远。',level:'下下'},
  '2.2':{poem:'身寒骨冷苦伶仃，此命推来行乞人；劳劳碌碌无度日，终年打拱过平生。',interpret:'根基浅薄，一生贫困。宜勤勉节俭，积德行善以改变命运。',level:'下下'},
  '2.3':{poem:'此命推来骨格轻，求谋作事事难成；妻儿兄弟应难许，别处他乡作散人。',interpret:'六亲缘薄，事业难成。宜离乡发展，或可化解。',level:'下下'},
  '2.4':{poem:'此命推来福禄无，门庭困苦总难荣；六亲骨肉皆无靠，流浪他乡作老翁。',interpret:'福禄浅薄，晚年孤独。宜早做人生规划，不可依赖他人。',level:'下下'},
  '2.5':{poem:'此命推来祖业微，门庭营度似稀奇；六亲骨肉如冰炭，一世勤劳自把持。',interpret:'祖业凋零，骨肉情薄。靠自身勤劳持家，晚年略有起色。',level:'下中'},
  '2.6':{poem:'平生衣禄苦中求，独自营谋事不休；离祖出门宜早计，晚来衣禄自无忧。',interpret:'早年辛苦离祖发展，中晚年逐渐安稳。不宜守家，宜外拓。',level:'下中'},
  '2.7':{poem:'一生作事少商量，难靠祖宗作主张；独马单枪空做去，早年晚岁总无长。',interpret:'一生独立，不假外求。个性固执，宜多听人言。',level:'下中'},
  '2.8':{poem:'一生行事似飘蓬，祖宗产业在梦中；若不过房改名姓，也当移徙二三通。',interpret:'根基不稳，宜改换门庭。搬家或改名可改善运势。',level:'下中'},
  '2.9':{poem:'初年运限未曾亨，纵有功名在后成；须过四旬才可立，移居改姓始为良。',interpret:'早年不顺，四十岁后方有起色。宜迁移发展，中年转运。',level:'中平'},
  '3.0':{poem:'劳劳碌碌苦中求，东奔西走何日休；若使终身勤与俭，老来稍可免忧愁。',interpret:'一生辛勤，勤俭持家可安度晚年。不宜投机取巧。',level:'中平'},
  '3.1':{poem:'忙忙碌碌苦中求，何日云开见日头；难得祖基家可立，中年衣食渐无忧。',interpret:'中年后运势渐开，衣食无忧。宜坚持本业，不可半途而废。',level:'中平'},
  '3.2':{poem:'初年运蹇事难谋，渐有财源如水流；到得中年衣食旺，那时名利一齐收。',interpret:'早年困顿，中年发迹。先苦后甜之命，守得云开见月明。',level:'中平'},
  '3.3':{poem:'早年做事事难成，百年勤劳枉费心；半世自如流水去，后来运到始得金。',interpret:'早年辛苦无获，中年后方有所得。不可急于求成，水到渠成。',level:'中平'},
  '3.4':{poem:'此命福气果如何，僧道门中衣禄多；离祖出家方为妙，朝晚拜佛念弥陀。',interpret:'与佛道有缘。宜从事文化、教育、宗教类行业。离祖发展更佳。',level:'中平'},
  '3.5':{poem:'生平福量不周全，祖业根基觉少传；营事生涯宜守旧，时来衣食胜从前。',interpret:'宜守不宜攻。时机到来时自会好转，不可冒险行事。',level:'中平'},
  '3.6':{poem:'不须劳碌过平生，独自成家福不轻；早有福星常照命，任君行去百般成。',interpret:'福星高照，独立成家。诸事顺遂，心想事成。',level:'中吉'},
  '3.7':{poem:'此命般般事不成，弟兄少力自孤行；虽然祖业须微有，来得明时去不明。',interpret:'兄弟缘薄，财运来去无常。宜守财惜福，不宜借贷担保。',level:'中平'},
  '3.8':{poem:'一身骨肉最清高，早入簧门姓氏标；待到年将三十六，蓝衫脱去换红袍。',interpret:'早年学业出众，三十六岁后事业腾达。少年得志之命。',level:'中吉'},
  '3.9':{poem:'此命终身运不通，劳劳作事尽皆空；苦心竭力成家计，到得那时在梦中。',interpret:'一生劳碌难成，多有梦幻泡影。宜顺其自然，不可强求。',level:'下中'},
  '4.0':{poem:'平生衣禄是绵长，件件心中自主张；前面风霜多受过，后来必定享安康。',interpret:'早年风雨历练，中晚年福报降临。先苦后甜之命，老来自在。',level:'中吉'},
  '4.1':{poem:'此命推来自不同，为人能干异凡庸；中年还有逍遥福，不比前时运未通。',interpret:'才华出众，中年后运通发达。逍遥自在，名利可期。',level:'中吉'},
  '4.2':{poem:'得宽怀处且宽怀，何用双眉皱不开；若使中年命运济，那时名利一起来。',interpret:'放宽心态，中年名利双收。不可过于焦虑，时运自会好转。',level:'中吉'},
  '4.3':{poem:'为人心性最聪明，作事轩昂近贵人；衣禄一生天注定，不须劳碌是丰亨。',interpret:'聪明过人，贵人运旺。衣禄丰足，一生享用不尽。',level:'中吉'},
  '4.4':{poem:'万事由天莫苦求，须知福碌赖人修；当年财帛难如意，晚景欣然便不忧。',interpret:'知足常乐。早年财运一般，晚年好转。多行善事可增福。',level:'中吉'},
  '4.5':{poem:'名利推来竟若何，前番辛苦后奔波；命中难养男和女，骨肉扶持也不多。',interpret:'奔波劳碌，子女缘薄。宜多积德行善，老来方能安享。',level:'中平'},
  '4.6':{poem:'东西南北尽皆通，出姓移居更觉隆；衣禄无穷无数定，中年晚景一般同。',interpret:'外出运旺，移居有利。一生衣禄不缺，四通八达之命。',level:'中吉'},
  '4.7':{poem:'此命推来旺末年，妻荣子贵自怡然；平生原有滔滔福，可卜财源若水泉。',interpret:'晚年运势旺盛，妻贤子贵。财源滚滚，福泽深厚。',level:'中吉'},
  '4.8':{poem:'初年运道未曾通，几许蹉跎命亦穷；兄弟六亲无依靠，一生事业晚来整。',interpret:'早年困顿，晚年事业方成。大器晚成，不可轻言放弃。',level:'中平'},
  '4.9':{poem:'此命推来福不轻，自成自立显门庭；从来富贵人钦敬，使婢差奴过一生。',interpret:'白手起家，自成门庭。受人尊敬，一生富贵。',level:'中吉'},
  '5.0':{poem:'为利为名终日劳，中年福禄也多遭；老来自有财星照，不比前番目下高。',interpret:'中年劳碌奔波，晚年财旺。晚年运好于早年。',level:'中吉'},
  '5.1':{poem:'一世荣华事事通，不须劳碌自亨通；兄弟叔侄皆如意，家业成时福禄宏。',interpret:'一世荣华，诸事亨通。家庭和睦，福禄双全。',level:'上吉'},
  '5.2':{poem:'一世亨通事事能，不须劳苦自然成；兄弟叔侄皆如意，家业丰亨喜盈盈。',interpret:'万事如意，家业兴旺。福星高照，一生顺遂。',level:'上吉'},
  '5.3':{poem:'此格推来福泽宏，兴家立业在其中；一生衣食安排定，却是人间一福翁。',interpret:'福泽深厚，兴家立业。一生衣食无忧，福气满满。',level:'上吉'},
  '5.4':{poem:'此命推来厚且清，诗书满腹看功成；丰衣足食自然稳，正是人间有福人。',interpret:'饱读诗书，功成名就。丰衣足食，有福之人。',level:'上吉'},
  '5.5':{poem:'走马扬鞭争利名，少年作事费评论；一朝福禄源源至，富贵荣华显六亲。',interpret:'少年奋发，中年富贵。名利双收，光宗耀祖。',level:'上吉'},
  '5.6':{poem:'此格推来礼仪通，一生福禄用无穷；甜酸苦辣皆尝过，滚滚财源稳而丰。',interpret:'通达礼仪，历经沧桑。财源稳固，福禄无穷。',level:'上吉'},
  '5.7':{poem:'福禄丰盈万事全，一身荣耀乐天年；名扬威震人争羡，此世逍遥宛似仙。',interpret:'福禄双全，名扬四海。逍遥自在，神仙之命。',level:'上吉'},
  '5.8':{poem:'平生福禄自然来，名利兼全福寿偕；雁塔题名为贵客，紫袍金带走金阶。',interpret:'名利双收，福寿双全。位极人臣，富贵荣华。',level:'上吉'},
  '5.9':{poem:'细推此格秀而清，必定才高学业成；甲第之中应有分，扬鞭走马显威荣。',interpret:'才华横溢，金榜题名。仕途顺利，光耀门楣。',level:'上吉'},
  '6.0':{poem:'一朝金榜快题名，显祖荣宗大器成；衣禄定然原裕足，田园财帛更丰盈。',interpret:'金榜题名，大器晚成。家业丰盈，富贵荣华。',level:'上吉'},
  '6.1':{poem:'不做朝中金榜客，定为世上大财翁；聪明天付经书熟，名显高袍自是荣。',interpret:'不为官便为富。聪明过人，财运亨通之命。',level:'上吉'},
  '6.2':{poem:'此命生来福不穷，读书必定显亲宗；紫衣玉带为卿相，富贵荣华遇不穷。',interpret:'读书功名，位列公卿。富贵荣华，享用不尽。',level:'上吉'},
  '6.3':{poem:'公侯卿相本无种，自小读书在其中；时来天地皆同力，一举成名天下闻。',interpret:'命中注定位极人臣。时机一到，天下闻名。',level:'上吉'},
  '6.4':{poem:'此格推来气象真，兴家发达在其中；一生福禄安排定，却是人间一富翁。',interpret:'气象不凡，家业兴旺。命中注定为大富翁。',level:'上吉'},
  '6.5':{poem:'细推此命福非轻，富贵荣华孰与争；定国安邦人极品，威声显赫震寰瀛。',interpret:'极品贵命，定国安邦。声名显赫，震古烁今。',level:'上吉'},
  '6.6':{poem:'此格人间一福人，堆金积玉满堂春；从来富贵由天定，正笏垂绅谒圣君。',interpret:'天降福人，富甲一方。贵不可言，圣眷恩隆。',level:'上吉'},
  '6.7':{poem:'此命生来福自宏，田园家业最高隆；平生衣禄丰盈足，一世荣华万事通。',interpret:'福运宏大，家业兴隆。万事亨通，一生荣华。',level:'上吉'},
  '6.8':{poem:'富贵由天莫苦求，万金家计不用愁；十年窗下无人问，一举成名天下知。',interpret:'天命富贵，苦读成名。一举成名天下知。',level:'上吉'},
  '6.9':{poem:'君是人间衣禄星，一生富贵众人钦；纵然福禄由天定，安享荣华过一生。',interpret:'衣禄之星，富贵天成。安享荣华，万人钦羡。',level:'上吉'},
  '7.0':{poem:'此命推来福不轻，何须愁虑苦劳心；荣华富贵已天定，正笏垂绅拜紫宸。',interpret:'天命富贵，位极人臣。一生无需劳心，福报天成。',level:'上吉'},
  '7.1':{poem:'此命生成大不同，公侯卿相在其中；一生自有逍遥福，富贵荣华极品隆。',interpret:'极品之命，公侯卿相。富贵荣华至极，逍遥人间。',level:'上吉'},
}

// ── 女命断语 ──
const FEMALE: Record<string,Fortune> = {
  '2.1':{poem:'命中注定守空房，花开花谢两茫茫；一世劳心终无靠，独对孤灯度时光。',interpret:'婚姻缘薄，一生孤苦。宜修身养性，不可强求姻缘。',level:'下下'},
  '2.2':{poem:'寒梅独放雪中埋，命中注定苦中捱；终日奔波为家计，老来依然是空怀。',interpret:'一生辛劳持家却难有回报。宜放宽心态，平淡度日。',level:'下下'},
  '2.3':{poem:'此命推来福禄轻，绣楼织锦总难成；夫君兄弟皆无靠，独守空闺过一生。',interpret:'六亲无靠，丈夫助力少。宜自立自强，不假外求。',level:'下下'},
  '2.4':{poem:'门前冷落车马稀，命中注定福分低；终日辛劳无所得，老来孤苦有谁依。',interpret:'福分浅薄，晚年孤独。宜早做养老打算，积谷防饥。',level:'下下'},
  '2.5':{poem:'此命推来家业微，终日奔波为食衣；夫妻子女皆冷淡，独自撑持度日非。',interpret:'家业凋零，家人情薄。一生靠自己支撑。宜心态平和。',level:'下中'},
  '2.6':{poem:'平生衣禄苦中求，独守空房度春秋；若得离乡别祖去，老来衣食不用愁。',interpret:'早年辛苦，宜离祖发展。晚运尚可，老来自有安排。',level:'下中'},
  '2.7':{poem:'此命一生少商量，难靠夫君自主张；独马单枪空做去，命中注定守空房。',interpret:'丈夫助力少，凡事靠自己。宜学会独立自强。',level:'下中'},
  '2.8':{poem:'命中注定走天涯，祖业凋零似落花；若能改名换姓去，晚年方可得荣华。',interpret:'根基不稳，宜改换环境。改名迁居可改善运势。',level:'下中'},
  '2.9':{poem:'初年运限未曾通，纵有功名在后成；须过四旬方可立，移居他处始为亨。',interpret:'早年不顺，四十岁后好转。宜迁移发展，晚运渐通。',level:'中平'},
  '3.0':{poem:'终日奔波苦中求，东奔西走何日休；若得终身勤俭守，老来衣食不须愁。',interpret:'一生勤劳，勤俭持家。晚年安稳，平淡是福。',level:'中平'},
  '3.1':{poem:'忙忙碌碌苦中求，何日云开见日头；难得夫君能依靠，中年衣食渐无忧。',interpret:'中年后运势渐好，丈夫运势上升带动家运。',level:'中平'},
  '3.2':{poem:'初年运蹇事难谋，渐有财源如水流；到得中年衣食旺，夫君得力福悠悠。',interpret:'早年辛苦，中年丈夫事业有成，家运随之兴旺。',level:'中平'},
  '3.3':{poem:'早年做事事难成，百计徒劳枉费心；半世自如流水去，后来运到遇良人。',interpret:'早年辛苦无获，中年后得遇良缘，命运转好。',level:'中平'},
  '3.4':{poem:'此命福气果非轻，绣楼织锦样样能；夫荣子贵家兴旺，老来安享福寿增。',interpret:'持家有道，丈夫事业有成，子女出息。晚景安乐。',level:'中平'},
  '3.5':{poem:'生平福量不周全，祖业根基觉少传；营事生涯宜守旧，时来夫贵子登贤。',interpret:'宜守不宜攻。时机到来时丈夫子女带来好运。',level:'中平'},
  '3.6':{poem:'不须劳碌过平生，夫荣子贵福不轻；早有福星常照命，任君行去百般成。',interpret:'福星高照，旺夫益子之命。一生顺遂安乐。',level:'中吉'},
  '3.7':{poem:'此命般般事难全，夫君少力自孤怜；虽然祖业须微有，财来财去似云烟。',interpret:'丈夫助力少，财运不稳。宜守财惜福。',level:'中平'},
  '3.8':{poem:'一身清秀自聪明，绣楼织锦样样精；待到年将三十六，夫荣子贵享安宁。',interpret:'聪慧能干，中年后夫荣子贵，安享幸福。',level:'中吉'},
  '3.9':{poem:'此命终身运不通，劳劳作事尽皆空；夫君儿女皆难靠，老来孤独一场空。',interpret:'一生辛劳难有成果，家人缘薄。宜调整心态。',level:'下中'},
  '4.0':{poem:'平生衣禄是绵长，件件心中自主张；前面风霜多受过，后来夫贵享安康。',interpret:'早年辛苦历练，中年后丈夫发达，随之安享。',level:'中吉'},
  '4.1':{poem:'此命推来自不同，为人能干异凡庸；中年夫贵子登位，一生安乐福无穷。',interpret:'聪慧能干，旺夫益子。中年后福报深厚。',level:'中吉'},
  '4.2':{poem:'得宽怀处且宽怀，何用双眉皱不开；若得夫君能发达，那时夫贵子登台。',interpret:'放宽心态，丈夫中年发迹带动家运。不宜焦虑。',level:'中吉'},
  '4.3':{poem:'为人心性最聪明，处事温良近贵人；夫荣子贵天注定，不用劳碌享丰亨。',interpret:'聪明温良，自带贵气。旺夫旺子之命，一生安享。',level:'中吉'},
  '4.4':{poem:'万事由天莫苦求，须知福禄赖人修；当年夫君难如意，晚景欣然子封侯。',interpret:'早年夫君运势平平，晚年子女有出息。知足常乐。',level:'中吉'},
  '4.5':{poem:'此命推来福不轻，夫君得力自天成；一世荣华安享尽，儿孙满堂乐盈盈。',interpret:'丈夫能干事业成，享受丈夫带来的福气。儿孙满堂。',level:'中吉'},
  '4.6':{poem:'东西南北尽皆通，出姓移居更觉隆；夫君得力无穷定，中年晚景一般同。',interpret:'外出运旺，宜随夫移居。一生安乐平稳。',level:'中吉'},
  '4.7':{poem:'此命推来旺末年，夫荣子贵自怡然；平生原有滔滔福，财源滚滚似水泉。',interpret:'晚年运势旺，丈夫子女皆发达。富贵之命。',level:'中吉'},
  '4.8':{poem:'初年运道未曾通，几许蹉跎命亦穷；夫君儿女虽平淡，一生事业晚来隆。',interpret:'早年辛苦，晚年平稳。平淡是福，安心度日。',level:'中平'},
  '4.9':{poem:'此命推来福不轻，夫荣子贵显门庭；从来富贵人钦敬，安享荣华过一生。',interpret:'旺夫旺子，受人尊敬。一生荣华安享。',level:'中吉'},
  '5.0':{poem:'为家为计终日劳，中年福禄也多遭；老来夫贵子登位，安享荣华福寿高。',interpret:'中年劳碌，晚年福至。丈夫子女带来好运。',level:'中吉'},
  '5.1':{poem:'一世荣华事事通，不须劳碌自亨通；夫荣子贵皆如意，家业成时福禄宏。',interpret:'一世荣华，夫贵子贤。福禄双全之命。',level:'上吉'},
  '5.2':{poem:'一世亨通事事能，不须劳苦自然成；夫君儿女皆如意，家业丰亨喜盈盈。',interpret:'万事亨通，家庭美满。一生幸福安乐。',level:'上吉'},
  '5.3':{poem:'此格推来福泽宏，旺夫益子在其中；一生衣食安排定，却是人间一福星。',interpret:'福泽深厚，旺夫益子。人间福星，一生顺遂。',level:'上吉'},
  '5.4':{poem:'此命推来厚且清，知书达理样样精；丰衣足食夫荣贵，正是人间有福星。',interpret:'知书达理，丈夫发达。富贵之命，福气满满。',level:'上吉'},
  '5.5':{poem:'走马扬鞭争利名，夫君作事显英名；一朝福禄源源至，夫荣子贵耀门庭。',interpret:'丈夫事业有成，家业兴旺。贵妇之命。',level:'上吉'},
  '5.6':{poem:'此格推来礼仪通，一生福禄用无穷；酸甜苦辣皆尝过，滚滚财源稳而丰。',interpret:'通达礼仪，历经沧桑后福报深厚。财运稳固。',level:'上吉'},
  '5.7':{poem:'福禄丰盈万事全，夫荣子贵乐天年；名扬威震人争羡，此世逍遥宛似仙。',interpret:'福禄双全，家庭美满。一生逍遥，神仙之命。',level:'上吉'},
  '5.8':{poem:'平生福禄自然来，夫荣子贵福寿偕；门庭兴旺人钦敬，紫袍金带走金阶。',interpret:'丈夫功成名就，自身福寿双全。荣耀之命。',level:'上吉'},
  '5.9':{poem:'细推此格秀而清，必定才高百事成；夫荣子贵登甲第，扬鞭走马显威荣。',interpret:'自身才华出众，丈夫子女皆发达。光耀门楣。',level:'上吉'},
  '6.0':{poem:'一朝金榜快题名，夫荣子贵大器成；衣禄定然原裕足，田园财帛更丰盈。',interpret:'夫荣子贵，家业兴旺。一生富贵享受不尽。',level:'上吉'},
  '6.1':{poem:'此命生来福不穷，夫君富贵显亲宗；金玉满堂皆自得，一生安享乐无穷。',interpret:'丈夫大富大贵，安享荣华。福气满满之命。',level:'上吉'},
  '6.2':{poem:'此命生来福不穷，夫荣子贵显门庭；金玉满堂春不尽，紫袍金带享安宁。',interpret:'丈夫位极人臣，子女成才。一生荣华安享。',level:'上吉'},
  '6.3':{poem:'此命推来福泽深，夫君显贵众人钦；金玉珠宝皆不缺，一世荣华享太平。',interpret:'丈夫显赫，富甲一方。贵妇之命，一世太平。',level:'上吉'},
  '6.4':{poem:'此格推来气象新，旺夫益子福无垠；一生富贵安排定，却是人间一福神。',interpret:'旺夫益子至极，福气无边。命中注定为福神。',level:'上吉'},
  '6.5':{poem:'细推此命福非轻，夫荣子贵孰与争；门庭赫奕人钦敬，安享荣华度此生。',interpret:'极品贵妇之命。丈夫子女皆位极人臣，一生荣耀。',level:'上吉'},
  '6.6':{poem:'此命人间一福星，堆金积玉满堂春；夫君显贵由天定，安享荣华万事成。',interpret:'天降福星，丈夫大贵。金玉满堂，一生圆满。',level:'上吉'},
  '6.7':{poem:'此命生来福自宏，夫君儿女最高隆；平生衣禄丰盈足，一世荣华万事通。',interpret:'福运宏大，家人皆发达。万事亨通，一世荣华。',level:'上吉'},
  '6.8':{poem:'此命生成大不同，夫荣子贵在其中；金玉满堂皆不缺，安享荣华乐无穷。',interpret:'天定贵命，夫荣子贵。一生安乐，福气无穷。',level:'上吉'},
  '6.9':{poem:'君是人间衣禄星，夫荣子贵众人钦；一生福禄由天定，安享荣华过一生。',interpret:'衣禄之星，丈夫子女皆贵。安享荣华一生。',level:'上吉'},
  '7.0':{poem:'此命推来福不轻，夫荣子贵享太平；荣华富贵已天定，安享人间福寿宁。',interpret:'天命富贵，夫荣子贵。太平盛世享福之命。',level:'上吉'},
  '7.1':{poem:'此命生成大不同，夫荣子贵在其中；一生自有逍遥福，富贵荣华极品隆。',interpret:'极品贵命。丈夫子女皆位极人臣，富贵至极。',level:'上吉'},
}

export default function ChengguClient() {
  const [isSolar, setIsSolar] = useState(true)
  const [gender, setGender] = useState<'male'|'female'>('male')
  const [year, setYear] = useState('1990')
  const [month, setMonth] = useState('1')
  const [day, setDay] = useState('1')
  const [hourIdx, setHourIdx] = useState(5)
  const [result, setResult] = useState<any>(null)

  const calc = () => {
    try {
      const y = parseInt(year), m = parseInt(month), d = parseInt(day)
      let lunar: any, solarLabel: string, lunarLabel: string
      if (isSolar) {
        const solar = Solar.fromYmd(y, m, d)
        lunar = solar.getLunar()
        solarLabel = solar.toFullString()
        lunarLabel = lunar.toFullString()
      } else {
        lunar = Lunar.fromYmd(y, m, d)
        lunarLabel = lunar.toFullString()
        try { solarLabel = lunar.getSolar().toFullString() } catch { solarLabel = '—' }
      }
      const gzYear = lunar.getYearInGanZhi()
      const lMonth = lunar.getMonth()
      const lDay = lunar.getDay()
      const yearW = YEAR_W[gzYear] || 0
      const monthW = MONTH_W[lMonth] || 0
      const dayW = DAY_W[lDay] || 0
      const dz = HOUR_DZ[hourIdx]
      const hourW = HOUR_W[hourIdx] || 0
      const total = yearW + monthW + dayW + hourW
      const totalStr = total.toFixed(1)
      const liang = Math.floor(total)
      const qian = Math.round((total - liang) * 10)
      const fortuneDB = gender === 'male' ? MALE : FEMALE
      const fortune = fortuneDB[totalStr] || fortuneDB['4.0']
      setResult({ yearW, monthW, dayW, hourW, total, liang, qian, gzYear, lMonth, lDay, dz, solarLabel, lunarLabel, gender, ...fortune })
    } catch { setResult(null) }
  }

  const r = result

  return (<div className="max-w-2xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">称骨算命</h1>
    <p className="text-gray-400 mb-6">袁天罡称骨法：支持阳历/阴历输入，自动换算。男命女命分断，精准解读命运骨重。</p>

    <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-6 mb-8">
      {/* 历法选择 */}
      <div className="flex gap-2 mb-4">
        <button onClick={()=>{setIsSolar(true);setResult(null)}}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${isSolar?'bg-gold-600 text-dark-900':'bg-dark-700 text-gray-400 border border-dark-600'}`}>☀️ 阳历</button>
        <button onClick={()=>{setIsSolar(false);setResult(null)}}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${!isSolar?'bg-gold-600 text-dark-900':'bg-dark-700 text-gray-400 border border-dark-600'}`}>🌙 阴历</button>
        <span className="text-[10px] text-gray-500 self-center ml-2">自动换算阴阳历</span>
      </div>

      {/* 性别选择 */}
      <div className="flex gap-2 mb-4">
        <button onClick={()=>{setGender('male');setResult(null)}}
          className={`px-4 py-1.5 text-xs rounded-lg transition-colors ${gender==='male'?'bg-blue-700 text-white':'bg-dark-700 text-gray-400 border border-dark-600'}`}>♂ 男命</button>
        <button onClick={()=>{setGender('female');setResult(null)}}
          className={`px-4 py-1.5 text-xs rounded-lg transition-colors ${gender==='female'?'bg-rose-700 text-white':'bg-dark-700 text-gray-400 border border-dark-600'}`}>♀ 女命</button>
        <span className="text-[10px] text-gray-500 self-center ml-2">男女断语不同</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div><label className="text-xs text-gray-400 block mb-1">{isSolar?'阳历':'阴历'}年</label>
          <input type="number" value={year} onChange={e=>setYear(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
        <div><label className="text-xs text-gray-400 block mb-1">{isSolar?'阳历':'阴历'}月</label>
          <input type="number" min={1} max={12} value={month} onChange={e=>setMonth(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
        <div><label className="text-xs text-gray-400 block mb-1">{isSolar?'阳历':'阴历'}日</label>
          <input type="number" min={1} max={31} value={day} onChange={e=>setDay(e.target.value)} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200" /></div>
        <div><label className="text-xs text-gray-400 block mb-1">时辰</label>
          <select value={hourIdx} onChange={e=>setHourIdx(parseInt(e.target.value))} className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-gray-200 text-sm">
            {HOUR_DZ.map((dz,i)=><option key={i} value={i}>{dz}时 ({HOUR_RANGES[i][0]}-{HOUR_RANGES[i][1]}点)</option>)}
          </select></div>
      </div>
      <button onClick={calc} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95">称骨测算</button>
    </div>

    {r && (<div className="space-y-4">
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5 text-center">
        <p className="text-xs text-gray-500 mb-1">
          {r.gender === 'male' ? '♂ 男命' : '♀ 女命'} · 出生年柱：{r.gzYear}
        </p>
        <p className="text-[10px] text-gray-400">阳历：{r.solarLabel}</p>
        <p className="text-[10px] text-gray-400 mb-2">阴历：{r.lunarLabel}</p>
        <p className="text-4xl font-bold text-gold-400">{r.liang}两{r.qian}钱</p>
        <p className={`text-sm mt-1 ${r.level==='上吉'?'text-green-400':r.level==='中吉'?'text-green-500':r.level==='中平'?'text-yellow-400':'text-red-400'}`}>骨重：{r.liang}两{r.qian}钱 · {r.level}</p>
      </div>

      <div className="grid grid-cols-4 gap-2 text-xs">
        {[
          {label:'年柱',v:r.gzYear,w:`${r.yearW}两`},
          {label:'月(农历)',w:`${r.monthW}两`,v:`${r.lMonth}月`},
          {label:'日(农历)',w:`${r.dayW}两`,v:`${r.lDay}日`},
          {label:'时柱',w:`${r.hourW}两`,v:r.dz+'时'},
        ].map((x,i)=>(
          <div key={i} className="bg-dark-700 rounded-lg p-2 text-center border border-dark-600">
            <p className="text-gray-500">{x.label}</p><p className="text-gray-200">{x.v}</p><p className="text-gold-400">{x.w}</p>
          </div>
        ))}
      </div>

      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <h3 className="text-sm font-semibold text-gold-400 mb-2">{r.gender === 'male' ? '♂ 男命称骨诗' : '♀ 女命称骨诗'}</h3>
        <p className="text-sm text-gray-200 leading-loose whitespace-pre-line">{r.poem}</p>
      </div>
      <div className="bg-dark-800/80 backdrop-blur rounded-xl border border-dark-600 p-5">
        <h3 className="text-sm font-semibold text-gold-400 mb-2">{r.gender === 'male' ? '♂ 男命解读' : '♀ 女命解读'}</h3>
        <p className="text-sm text-gray-300 leading-relaxed">{r.interpret}</p>
      </div>
    </div>)}
  </div>)
}
