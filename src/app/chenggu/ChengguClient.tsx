'use client'

import { useState } from 'react'
import { useT, useLocale } from '@/lib/i18n'
import { Solar, Lunar } from 'lunar-typescript'
import ShareResult from '../../components/ShareResult'
import CalendarInput, { type CalendarType } from '@/components/CalendarInput'

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
const HOUR_W = [1.6,0.6,0.7,1.0,0.9,1.6,1.0,0.8,0.8,0.9,0.6,0.6]

interface Fortune { poem: string; interpret: string; level: string }

// ── 男命断语 (zh-CN base) ──
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

// ── 女命断语 (zh-CN base) ──
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

// ── Level translations ──
const LEVEL_EN: Record<string, string> = { '下下':'Low', '下中':'Below Avg.', '中平':'Average', '中吉':'Good', '上吉':'Excellent' }
const LEVEL_JA: Record<string, string> = { '下下':'大凶', '下中':'凶', '中平':'中平', '中吉':'中吉', '上吉':'大吉' }
const LEVEL_KO: Record<string, string> = { '下下':'대흉', '下中':'하중', '中平':'중평', '中吉':'중길', '上吉':'대길' }

// ── Fortune translations for EN ──
const MALE_EN: Record<string,{poem:string;interpret:string}> = {
  '2.1':{poem:'Short-lived with no career, a life of disasters; misfortune strikes, trapped in adversity, nothing achieved.',interpret:'A rough path — much toil with little gain. Stay level-headed, do good deeds, and avoid overreaching.'},
  '2.2':{poem:'Bitter cold bones, a beggar\'s fate; toiling ceaselessly, bowing through life.',interpret:'Shallow roots, a life of poverty. Be diligent and frugal, accumulate virtue to change fate.'},
  '2.3':{poem:'Light bones by fate, seeking and striving all in vain; wife, children, brothers hard to keep, a wanderer in distant lands.',interpret:'Thin family bonds, career hard to achieve. Better to leave home and develop elsewhere.'},
  '2.4':{poem:'No fortune or blessing by fate, gate and courtyard ever in difficulty; no kin to rely on, an old vagrant in strange lands.',interpret:'Shallow blessings, lonely old age. Plan life early, don\'t depend on others.'},
  '2.5':{poem:'Ancestral estate meager, household struggling; kin like ice and charcoal, a lifetime of labor self-sustained.',interpret:'Family fortunes faded, bonds thin. Rely on own diligence; slight improvement in later years.'},
  '2.6':{poem:'Clothing and food sought through hardship, toiling alone without rest; leave home and ancestry early, later years worry-free.',interpret:'Early hardship away from home, gradual stability in mid-to-late years. Expand outward, don\'t stay put.'},
  '2.7':{poem:'A life without consultation, ancestors no help; lone horse single spear charging empty, youth and age both gainless.',interpret:'Independent life, not relying on external help. Stubborn — listen more to others.'},
  '2.8':{poem:'Life like drifting weed, ancestral estate but a dream; if not adopted or renamed, move house two or three times.',interpret:'Unstable foundation — change environment. Moving or renaming can improve luck.'},
  '2.9':{poem:'Early years not smooth, fame and success come later; past forty can stand, relocation and name change best.',interpret:'Early years rough, improvement after forty. Move to develop, mid-life turn of fortune.'},
  '3.0':{poem:'Toiling bitterly seeking, rushing east and west when will it end; if diligent and frugal lifelong, old age may avoid worry.',interpret:'A life of hard work. Frugality and diligence ensure a peaceful old age. Don\'t cut corners.'},
  '3.1':{poem:'Busy and bitter seeking, when will the clouds part to see the sun; barely a family foundation, midlife food and clothing worry-free.',interpret:'Fortune opens after midlife — food and clothing assured. Stick to your trade, don\'t give up halfway.'},
  '3.2':{poem:'Early years blocked, wealth comes slowly like flowing water; by midlife food and clothing abundant, fame and profit together.',interpret:'Early hardship, midlife rise. Sweet after bitter — wait for clear skies after the rain.'},
  '3.3':{poem:'Early efforts hard to achieve, a century of toil in vain; half a lifetime like flowing water, then fortune arrives with gold.',interpret:'Early years fruitless, gain after midlife. Don\'t rush — when water flows, a channel forms.'},
  '3.4':{poem:'How is this fate\'s blessing? Plenty in monk or Taoist robes; leave ancestors and become a monk, morning and evening chant Buddha.',interpret:'Connected to Buddhism/Taoism. Suitable for culture, education, religion. Better to develop away from home.'},
  '3.5':{poem:'Life\'s fortune incomplete, ancestral foundation thin; business should stick to the old ways, when time comes food and clothing surpass before.',interpret:'Defend rather than attack. When the time comes, things will improve. Don\'t take risks.'},
  '3.6':{poem:'No need for toil through life, independent family with no small blessing; lucky star shines early, whatever you do succeeds.',interpret:'Lucky star shines. Independent home builder. Everything goes well, wishes come true.'},
  '3.7':{poem:'Nothing succeeds with this fate, brothers weak, walking alone; ancestral estate slight, income unclear where it goes.',interpret:'Thin brotherly bonds, fortune comes and goes. Guard wealth, don\'t lend or guarantee.'},
  '3.8':{poem:'Pure and noble bones, early school fame marked; at thirty-six, shed blue robe for red.',interpret:'Outstanding early education, career soars after thirty-six. Early success destiny.'},
  '3.9':{poem:'Lifelong fortune blocked, all labor comes to nothing; painstaking effort to build a family, all but a dream.',interpret:'Hard work without achievement, many illusions. Go with the flow, don\'t force things.'},
  '4.0':{poem:'Lifelong clothing and food abundant, everything decided in one\'s mind; much frost endured early, later enjoyment of peace.',interpret:'Wind and rain in early years, blessings descend in mid-to-late years. Sweet after bitter, freedom in old age.'},
  '4.1':{poem:'This fate is different, capable beyond the ordinary; midlife has leisure and fortune, unlike earlier blocked luck.',interpret:'Outstanding talent, fortune opens after midlife. Carefree, fame and profit attainable.'},
  '4.2':{poem:'Where you can be at ease, be at ease; why knit your brows? If midlife fortune helps, fame and profit come together.',interpret:'Relax your mind, midlife brings both fame and fortune. Don\'t be overly anxious, luck will turn.'},
  '4.3':{poem:'Most intelligent in nature, doing things with vigor near benefactors; clothing and food fated lifelong, no toil needed for abundance.',interpret:'Exceptionally smart, strong benefactor luck. Plentiful provisions, endless enjoyment.'},
  '4.4':{poem:'All things depend on heaven, don\'t toil bitterly; know that blessings depend on cultivation; wealth hard to satisfy in youth, old age brings joy without worry.',interpret:'Contentment brings happiness. Average early wealth, improvement in old age. Good deeds increase blessings.'},
  '4.5':{poem:'Fame and profit — how are they? First hardship, then rushing; hard to raise children, little support from kin.',interpret:'Rushing and toiling, thin children luck. Accumulate virtue for peaceful old age.'},
  '4.6':{poem:'Open in all directions, change surname and move even better; endless clothing and food assured, midlife and old age the same.',interpret:'Strong outgoing luck, moving beneficial. Lifelong provisions, a well-connected destiny.'},
  '4.7':{poem:'This fate flourishes in later years, wife glorious children noble with joy; lifelong abundant fortune, wealth like a spring.',interpret:'Late years luck peaks, virtuous wife and noble children. Wealth flows, deep blessings.'},
  '4.8':{poem:'Early fortune not yet flowing, much wasted time and poverty; no support from siblings and kin, career accomplished late.',interpret:'Early hardship, career achieved late. Great vessel late to complete — don\'t give up easily.'},
  '4.9':{poem:'This fate\'s blessing is not light, self-established and prominent; always respected by the wealthy and noble, with servants through life.',interpret:'Self-made, established family. Respected by others, wealthy and noble through life.'},
  '5.0':{poem:'For profit and fame toiling daily, midlife fortune meets trouble; old age brings the wealth star, surpassing earlier days.',interpret:'Midlife toiling and rushing, wealth in old age. Later years better than early.'},
  '5.1':{poem:'Lifelong glory, all matters smooth; no need for toil, all goes well; brothers and nephews all satisfied, family accomplished with great blessings.',interpret:'Lifelong glory, all things smooth. Harmonious family, complete blessings.'},
  '5.2':{poem:'Lifelong smooth, everything achievable; no need for hard work, naturally accomplished; brothers and nephews all satisfied, family abundant and joyful.',interpret:'Everything goes well, family prosperous. Lucky star shines, life smooth.'},
  '5.3':{poem:'This pattern brings vast blessings, building family and career within; lifelong food and clothing arranged, a blessed elder on earth.',interpret:'Deep blessings, build family and career. Lifelong provisions, full of good fortune.'},
  '5.4':{poem:'This fate is thick and clear, full of learning and poetry seeing success; ample food and clothing naturally stable, truly a blessed person.',interpret:'Well-read, accomplished. Ample food and clothing, a blessed person.'},
  '5.5':{poem:'Whipping horse seeking fame and profit, youth\'s actions much debated; one day blessings pour in endlessly, wealth and glory shine on kin.',interpret:'Youth striving, midlife wealth and nobility. Fame and profit both gained, honoring ancestors.'},
  '5.6':{poem:'This pattern brings mastery of propriety, lifelong fortune never exhausted; sweet and sour, bitter and spicy all tasted, rolling wealth stable and abundant.',interpret:'Masters propriety, having weathered storms. Wealth stable, fortune endless.'},
  '5.7':{poem:'Fortune abundant, all things complete; glory and joy in old age; fame shakes the world, envied by all, carefree like an immortal.',interpret:'Complete fortune, fame worldwide. Carefree, an immortal\'s fate.'},
  '5.8':{poem:'Lifelong fortune comes naturally, fame and profit together with longevity; name on the pagoda as honored guest, purple robe gold belt on golden steps.',interpret:'Fame and profit both achieved, fortune and longevity complete. Highest official position, wealth and glory.'},
  '5.9':{poem:'Examining this pattern, elegant and clear; surely talented and learned; success in examinations, whip and horse displaying power and glory.',interpret:'Brilliant talent, passed exams. Smooth official career, bringing honor to family.'},
  '6.0':{poem:'One day quickly named on the golden list, honoring ancestors, great vessel achieved; clothing and food surely abundant, fields and wealth even more plentiful.',interpret:'Passed exams, great vessel late to complete. Family abundant, wealth and glory.'},
  '6.1':{poem:'Not a scholar on the golden list, surely a great wealthy man of the world; heaven-gifted intelligence and books mastered, fame and high robes bring glory.',interpret:'If not an official, then wealthy. Exceptionally smart, prosperous fortune.'},
  '6.2':{poem:'This fate born with endless fortune, study surely brings honor to family; purple robe jade belt as minister, wealth and glory encountered endlessly.',interpret:'Study brings official position, ranked among high ministers. Endless wealth and glory.'},
  '6.3':{poem:'Dukes and ministers are not born that way, study from youth holds the key; when time comes, heaven and earth join forces, one success known worldwide.',interpret:'Destined to reach the highest position. When the time comes, fame spreads worldwide.'},
  '6.4':{poem:'This pattern reveals true presence, building family and prosperity within; lifelong fortune arranged, truly a wealthy person on earth.',interpret:'Extraordinary presence, family prosperous. Destined to be a great wealthy person.'},
  '6.5':{poem:'Examining this fate, blessing is no small matter; wealth and glory — who can compete? Stabilizing the nation, highest quality person, power and fame shaking the world.',interpret:'Ultimate noble fate, stabilizing the nation. Renowned, shaking the ages.'},
  '6.6':{poem:'This pattern is a blessed person on earth, piled gold and jade fill the hall with spring; wealth and nobility heaven-decided, holding the scepter to visit the sage ruler.',interpret:'Heaven-sent blessed person, richest in the land. Incomparably noble, imperial favor abundant.'},
  '6.7':{poem:'This fate born with vast fortune, fields and family estate most exalted; lifelong ample food and clothing, one era of glory, all things smooth.',interpret:'Vast fortune, family estate thriving. Everything smooth, a lifetime of glory.'},
  '6.8':{poem:'Wealth and nobility from heaven, don\'t toil bitterly; ten thousand gold family estate needs no worry; ten years under the window unknown, one success known worldwide.',interpret:'Heaven-destined wealth, hard study brings fame. One success makes the world know you.'},
  '6.9':{poem:'You are the clothing and food star on earth, a lifetime of wealth and nobility admired by all; though fortune is heaven-decided, enjoy glory through life.',interpret:'Star of provision, heaven-made wealth. Enjoy glory, admired by ten thousand.'},
  '7.0':{poem:'This fate\'s blessing is not light, why worry and toil? Glory and wealth already heaven-decided, holding the scepter to worship at the purple palace.',interpret:'Heaven-destined wealth and nobility, highest official position. No need for worry, blessings are heaven-made.'},
  '7.1':{poem:'This fate is born completely different, dukes and ministers within; a lifetime of carefree fortune, ultimate wealth and glory.',interpret:'Ultimate fate, dukes and ministers. Extreme wealth and glory, carefree in the world.'},
}

const MALE_JA: Record<string,{poem:string;interpret:string}> = {
  '2.1':{poem:'短命で事業は空しく、生涯災難が重なる。凶禍が絶えず逆境に陥り、終世苦しく事成らず。',interpret:'運命に恵まれず、一生苦労しても成果は少ない。心を広く持ち、善行を積むことが大切。'},
  '2.2':{poem:'寒く骨冷えて孤独に、この運勢は乞食の相。労多くして日々を過ごし、一生ただ頭を下げて生きる。',interpret:'基盤が薄く、一生貧しい。勤勉で倹約し、徳を積んで運命を変えよ。'},
  '2.3':{poem:'この運勢は骨格軽く、事を謀るも成り難し。妻子兄弟も頼り難く、他郷で散人となる。',interpret:'親族の縁薄く、事業は成り難い。故郷を離れて発展するのが良い。'},
  '2.4':{poem:'この運勢に福禄なく、門庭は苦しく栄えず。六親の骨肉みな頼りなく、他郷を流浪して老翁となる。',interpret:'福禄薄く、老後は孤独。早めに人生設計をし、他人に頼るべからず。'},
  '2.5':{poem:'この運勢は祖業微かで、家計は苦しい。六親の骨肉は氷炭の如く、一世勤労して自ら支える。',interpret:'祖業は衰退し、家族の情も薄い。自らの勤労で家を支え、晩年にやや好転。'},
  '2.6':{poem:'平生の衣禄は苦の中に求め、独りで謀り事やまず。故郷を離れ出立は早くするが良く、晩年の衣禄は自ずから憂いなし。',interpret:'若年は苦労して故郷を離れ、中高年は徐々に安定。郷里にこだわらず外に展開すべし。'},
  '2.7':{poem:'一生事を為すに相談少なく、祖先に頼るも難しい。独り槍で空しく進み、若年も晩年も長続きせず。',interpret:'一生独り立ちで、外に頼らない。頑固な性格ゆえ、人の意見を聞くべし。'},
  '2.8':{poem:'一生の振る舞いは漂う蓬の如く、祖先の産業は夢の中。もし養子に行き改名しなければ、移転を二三度するだろう。',interpret:'基盤が不安定で、環境を変えるべき。引っ越しや改名で運勢が改善する。'},
  '2.9':{poem:'若年期は運が開けず、功名は後になって成る。四十を過ぎてようやく立ち、移住改名して初めて良し。',interpret:'若年は不運も、四十歳過ぎに好転。移転して発展し、中年に運が回る。'},
  '3.0':{poem:'労多く苦しみの中に求め、東奔西走していつ休まん。もし終身勤勉で倹約ならば、老いて少しは憂いを免れる。',interpret:'一生勤勉で、倹約して家を保てば安らかな晚年を送れる。投機は避けるべし。'},
  '3.1':{poem:'忙しく苦しみの中に求め、いつ雲が開けて日が見えるか。辛うじて祖業の基盤で家を立て、中年には衣食徐々に憂いなし。',interpret:'中年以降に運が開け、衣食に困らなくなる。本業を貫き、中途半端に放棄すべからず。'},
  '3.2':{poem:'若年期は運塞がり事を謀り難く、徐々に財源が水流の如くに。中年に至り衣食豊かに、その時名利ともに収まる。',interpret:'若年期は苦しくも、中年に出世。苦あれば楽あり、辛抱強く待てば月明かりの下。'},
  '3.3':{poem:'若年の事は成り難く、百年の勤労も心を費やすのみ。半世は流水のように過ぎ、後になって運が至り金を得る。',interpret:'若年期は苦労が実らず、中年以降に成果が出る。急いではならず、水到って渠成る。'},
  '3.4':{poem:'この命の福はいかばかりか、僧道の門中に衣禄多し。故郷を離れ出家するが良く、朝夕仏を拝み念仏を唱えよ。',interpret:'仏道と縁がある。文化・教育・宗教系の職業に適す。故郷を離れての発展が良い。'},
  '3.5':{poem:'平生の福量は周全ならず、祖業の根基は伝わること少なし。営みの生涯は旧を守るにしくはなく、時至れば衣食は昔に勝る。',interpret:'守りに徹し、攻めるべからず。時期が来れば自然と好転する。冒険は避けるべし。'},
  '3.6':{poem:'労せずして平生を過ごし、独りで家を成す福軽からず。早くより福星常に命を照らし、君の行くところ百般成る。',interpret:'福星に見守られ、独立して家を成す。万事順調で、思いのままに実現する。'},
  '3.7':{poem:'この命は万事成らず、兄弟力少なく孤り行く。祖業は微かに有るも、来る時は明らかなれど去る時は不明。',interpret:'兄弟の縁薄く、財運の出入りが不安定。財を守り惜しみ、借金や保証は避けるべし。'},
  '3.8':{poem:'一身骨肉最も清高く、早くに学校に入り姓名を標す。年に三十六に至らんとして、青衫を脱して紅袍に換える。',interpret:'若年期に学業優秀で、三十六歳以後に事業が大いに伸びる。若くして志を得る命。'},
  '3.9':{poem:'この命は終身運通ぜず、労して事を為すも尽く空し。苦心竭力して家計を成すも、その時到れば夢の中。',interpret:'一生苦労しても成し難く、多くは夢幻の如し。自然に任せ、無理に求めるべからず。'},
  '4.0':{poem:'平生の衣禄は長く続き、一つ一つ心の中で自ら主張す。前に風霜多く受けたれど、後に必ず安康を享受す。',interpret:'若年期の風雪が鍛錬となり、中高年に福報が訪れる。苦あれば楽ありの命。'},
  '4.1':{poem:'この命は推し来たって自ずから異なり、人として能くして凡庸に異なる。中年には逍遥の福あり、前の時に運の通ぜざるに比べず。',interpret:'才能抜群で、中年以降運が開けて発展する。逍遥自在、名声と利益が期待できる。'},
  '4.2':{poem:'心を寛ろげるべきところで寛ろげ、何ぞ眉を雙皺めて開かざらん。もし中年に命運が済えば、その時名利ともに来たらん。',interpret:'心を広く持ち、中年には名声と利益が共に得られる。あまり焦らず、運は自ずと好転する。'},
  '4.3':{poem:'人の心性最も聡明で、事を為すに意気軒昂にして貴人に近し。衣禄一生天の定めるところ、労するに及ばず豊かに亨る。',interpret:'聡明过人、貴人運旺。衣禄豊かで、一生享受し尽くすことなし。'},
  '4.4':{poem:'万事天に由れ、苦しみ求めるなかれ。須く福禄は人の修めに頼るを知るべし。当年の財帛は意の如くならずとも、晩景欣然として憂えず。',interpret:'足るを知る。早年の財運は平らかだが、晩年は好転する。善行を積んで福を増せ。'},
  '4.5':{poem:'名利を推し来たって竟に如何、前は辛苦し後に奔波す。命中に男と女を養い難く、骨肉の扶持も多からず。',interpret:'奔波苦労し、子女の縁薄い。多く徳を積み善を行い、老後の安らぎを得よ。'},
  '4.6':{poem:'東西南北尽く皆通じ、姓を改め移居すれば更に隆盛。衣禄は窮まりなく数定まり、中年の晩景も一般同じ。',interpret:'外出運が良く、移住に利あり。一生衣禄に欠けず、四方に通じる命。'},
  '4.7':{poem:'この命は末年が旺んと推し来たり、妻栄え子貴く自ら怡然。平生滔滔たる福有りて、財源は水泉の如しと卜すべし。',interpret:'晩年の運勢が旺盛で、妻は賢く子は貴い。財源滾滾として、福沢深い。'},
  '4.8':{poem:'若年は運道未だ通ぜず、幾許か蹉跎して命もまた窮す。兄弟六親は頼る所なく、一生の事業は晩に至って整う。',interpret:'若年は苦しく、晩年に事業が成る。大器晩成、軽々しく放棄すべからず。'},
  '4.9':{poem:'この命の福は軽からず推し来たり、自ら成り自ら立って門庭を顕す。從來の富貴は人も欽敬し、婢を使い奴を差して一生を過ごす。',interpret:'自らの手で家を興し、門戸を顕す。人に尊敬され、一生富み栄える。'},
  '5.0':{poem:'利の為名の為に終日労し、中年の福禄も多きに遭う。老いて自ずから財星照り有りて、前の番の目下の高きに比べず。',interpret:'中年は苦労奔波も、晩年は財旺。晩年の運が若年より良い。'},
  '5.1':{poem:'一世栄華万事通じ、労せずして自ずから亨通す。兄弟叔侄皆意の如く、家業成る時福禄宏なり。',interpret:'一世栄華、万事亨通。家庭和睦、福禄兼ね備える。'},
  '5.2':{poem:'一世亨通事事能くし、労苦せずして自然に成る。兄弟叔侄皆意の如く、家業豊かに亨り喜び盈々。',interpret:'万事如意、家業興隆。福星高照、一生順調。'},
  '5.3':{poem:'この格は福沢宏かに推し来たり、家を興し業を立つることの中に在り。一生の衣食定めて安排され、人間の一福翁。',interpret:'福沢深く、家を興し業を立てる。一生衣食憂いなく、福気満ち満ちている。'},
  '5.4':{poem:'この命は厚く且つ清らかと推し来たり、詩書腹に満ちて功成るを見る。豊衣足食自然に穩らかで、正に人間の有福人。',interpret:'詩書に通じ功名を成す。豊衣足食で、幸せな人。'},
  '5.5':{poem:'馬を走らせ鞭を揚げて利名を争い、少年の作事は評論を費やす。一朝福禄源源として至り、富貴栄華は六親に顕わる。',interpret:'少年期に奮発し、中年に富貴を得る。名利を兼ね備え、家門に光輝あらしめる。'},
  '5.6':{poem:'この格は礼儀に通ずと推し来たり、一生の福禄は用いて窮まりなし。酸甜苦辣皆嘗め尽くし、滾滾たる財源は穩やかにして豊か。',interpret:'礼儀に通じ、辛苦を経たる後の福報深し。財源は安定している。'},
  '5.7':{poem:'福禄豊かに盈ちて万事全く、一身は栄耀にて天年を楽しむ。名は揚がり威は震いて人も争い羨み、この世逍遥として仙の如し。',interpret:'福禄兼ね備え、名声天下に轟く。逍遥自適、仙人の命。'},
  '5.8':{poem:'平生の福禄自然に来たり、名利兼ね備えて福寿偕。雁塔に名を題して貴客、紫袍金帶は金階を歩む。',interpret:'名利共に得て、福寿兼ね備わる。最高位の官にのぼり、富貴栄華を極める。'},
  '5.9':{poem:'細かに推すにこの格は秀麗にして清く、必ず才高く学業成る。甲第の中に分有るべきで、鞭揚げ馬走らせ威栄を顕わす。',interpret:'才能溢れ、金榜に名を連ねる。官途順調で、家門に光輝あらしめる。'},
  '6.0':{poem:'一朝金榜に快く名を題し、祖を顕わし宗を栄えしめて大器成る。衣禄は定然として元より裕足で、田園の財帛更に豊かに盈つ。',interpret:'金榜題名、大器晩成。家業豊かで、富貴栄華を極める。'},
  '6.1':{poem:'朝廷の金榜客にならずとも、定めて世上の大財翁。聡明は天賦で経書に熟し、名顕れ高袍自ずから是れ栄。',interpret:'官ならざれば富を得る。聡明过人、財運亨通の命。'},
  '6.2':{poem:'この命は生まれ来て福窮まらず、書を読めば必ず親宗を顕わす。紫衣玉帶以て卿相となり、富貴栄華は遇うて窮まらず。',interpret:'書を読んで功名を得、公卿の列に連なる。富貴栄華、享受し尽くせず。'},
  '6.3':{poem:'公侯卿相は本と種無きも、自ら小より書を読む中に在り。時来たれば天地皆力を同じくし、一挙に成名して天下聞こゆ。',interpret:'運命づけられて最高位に至る。時至れば、天下に名を知られる。'},
  '6.4':{poem:'この格は気象真なりと推し来たり、家を興し発達することの中に在り。一生の福禄定めて安排し、却って人間の一富翁。',interpret:'気象不凡、家業興隆。運命づけられて大富豪となる。'},
  '6.5':{poem:'細かに推すにこの命の福軽からず、富貴栄華孰と争わん。国を定め邦を安んずる人極品、威声顕赫にして寰瀛を震わす。',interpret:'極上の貴命、国を定め邦を安んず。名声顕赫、古今を震わす。'},
  '6.6':{poem:'この格は人間の一福人、金を積み玉を堆して満堂春。從來の富貴は天の定めるところ、正笏垂紳して聖君に謁す。',interpret:'天よりの福人、富ことごとくを極める。貴言うべからず、聖眷恩隆。'},
  '6.7:':{poem:'この命は生まれ来て福自ら宏く、田園家業最も高隆。平生衣禄豊かに盈ち足り、一世の栄華万事通ず。',interpret:'福運宏大、家業興隆。万事亨通、一世の栄華。'},
  '6.8':{poem:'富貴は天に由れ苦しみ求めるなかれ、万金の家計は憂い用なし。十年窓下に人問うこと無きも、一挙に成名して天下知らる。',interpret:'天命の富貴、苦学して成名。一挙に成名、天下に知らる。'},
  '6.9':{poem:'君は人間の衣禄星、一生富貴にして衆人も欽む。縱え福禄は天の定めるとも、安らかに栄華を享受して一生を過ぐ。',interpret:'衣禄の星、富貴天なり。安らかに栄華を享受し、万人の羨望。'},
  '7.0':{poem:'この命の福軽からずと推し来たり、何ぞ愁い慮り苦しみ労せん。栄華富貴已に天の定め、正笏垂紳して紫宸に拝す。',interpret:'天命の富貴、位極めて人臣となる。一生心を労する要なく、福報天なり。'},
  '7.1':{poem:'この命は生成大いに同じからず、公侯卿相の中に在り。一生自ら逍遥の福有り、富貴栄華極品の隆。',interpret:'極品の命、公侯卿相。富貴栄華の至り、逍遥として人間に在り。'},
}
// Fix line with trailing colon in key '6.7'
const MALE_JA_FIXED: Record<string,{poem:string;interpret:string}> = {}
for (const [k,v] of Object.entries(MALE_JA)) {
  MALE_JA_FIXED[k.replace(':','')] = v
}

const FEMALE_EN: Record<string,{poem:string;interpret:string}> = {
  '2.1':{poem:'Destined to stay lonely, flowers bloom and fade in confusion; a lifetime of toil with no support, facing the lamp alone through time.',interpret:'Thin marriage luck, a life of solitude. Cultivate yourself, don\'t force romance.'},
  '2.2':{poem:'Cold plum blooming alone buried in snow, destined to endure hardship; running all day for the family, in old age still empty-handed.',interpret:'A life of辛苦 managing the household with little reward. Relax your mindset, live plainly.'},
  '2.3':{poem:'This fate brings light blessings, embroidery and weaving never complete; husband and brothers no support, guarding an empty chamber through life.',interpret:'No reliance on family, husband offers little help. Stand on your own, don\'t depend on others.'},
  '2.4':{poem:'The doorstep cold with few visitors, destined for low fortune; toiling daily with nothing gained, in old age who will be there?',interpret:'Shallow blessings, lonely old age. Plan for retirement early, save for hard times.'},
  '2.5':{poem:'This fate brings meager family estate, running all day for food and clothing; husband and children all indifferent, bearing life alone.',interpret:'Family fortunes faded, family feelings thin. Rely only on yourself. Keep a peaceful mind.'},
  '2.6':{poem:'Lifelong food and clothing sought through hardship, guarding an empty room through years; if you leave your hometown, old age food and clothing worry-free.',interpret:'Early hardship, better to leave home and develop. Late luck passable, things will be arranged in old age.'},
  '2.7':{poem:'This life has little consultation, hard to rely on husband for decisions; lone horse single spear charging empty, destined to guard an empty room.',interpret:'Husband offers little help, everything depends on yourself. Learn to be independent and strong.'},
  '2.8':{poem:'Destined to wander the world, ancestral estate withered like fallen flowers; if you can change your name and surname, old age may bring glory.',interpret:'Unstable foundation, change your environment. Renaming and moving can improve luck.'},
  '2.9':{poem:'Early years\' luck not yet flowing, fame and success come later; past forty can stand, move elsewhere to prosper.',interpret:'Early years not smooth, improvement after forty. Move to develop, late luck gradually opens.'},
  '3.0':{poem:'Running all day seeking bitterly, east and west when will it rest; if diligent and frugal lifelong, old age food and clothing worry-free.',interpret:'A life of hard work, diligent and frugal. Peaceful old age — plainness is blessing.'},
  '3.1':{poem:'Busy and bitter seeking, when will the clouds part to see the sun; if husband can be relied upon, midlife food and clothing gradually worry-free.',interpret:'Fortune improves after midlife, husband\'s rising luck lifts family fortune.'},
  '3.2':{poem:'Early years blocked, wealth comes slowly like flowing water; by midlife food and clothing abundant, husband capable with endless blessings.',interpret:'Early hardship, midlife husband succeeds in career, family fortune rises.'},
  '3.3':{poem:'Early efforts hard to achieve, a hundred schemes all in vain; half a lifetime like flowing water, then luck brings a good partner.',interpret:'Early years fruitless, good fate arrives after midlife, fortune turns for the better.'},
  '3.4':{poem:'This fate\'s blessing is not light, embroidery and weaving all skilled; husband glorious and children noble, family prosperous, old age peaceful with increased blessings.',interpret:'Skilled at managing the home, husband successful, children accomplished. Peaceful old age.'},
  '3.5':{poem:'Life\'s fortune incomplete, ancestral foundation but thinly passed; business should stick to old ways, when time comes husband noble, children distinguished.',interpret:'Defend rather than attack. When the time comes, husband and children bring good luck.'},
  '3.6':{poem:'No need to toil through life, husband glorious and children noble, blessing not light; lucky star shines early, whatever you do succeeds.',interpret:'Lucky star shines, a destiny that helps husband and children. Lifelong smooth and peaceful.'},
  '3.7':{poem:'This fate\'s aspects hard to complete, husband weak, pitiful and alone; ancestral estate somewhat present, wealth comes and goes like smoke.',interpret:'Husband offers little help, fortune unstable. Guard wealth and cherish blessings.'},
  '3.8':{poem:'Pure and intelligent, embroidery and weaving all masterful; when thirty-six comes, husband glorious and children noble, enjoying peace.',interpret:'Smart and capable, midlife husband and children bring glory, enjoying happiness.'},
  '3.9':{poem:'This fate lifelong luck blocked, all labor comes to nothing; husband and children hard to rely on, old age lonely and empty.',interpret:'Hard work with little result, thin family bonds. Adjust your mindset.'},
  '4.0':{poem:'Lifelong food and clothing abundant, everything decided in one\'s mind; much frost endured early, later husband noble, enjoying peace.',interpret:'Hardship in early years, husband succeeds after midlife, then enjoys peace.'},
  '4.1':{poem:'This fate is different and unique, capable beyond the ordinary; midlife husband noble, children in high positions, lifelong peace with endless blessings.',interpret:'Smart and capable, helps husband and children. Deep blessings after midlife.'},
  '4.2':{poem:'Where you can be at ease, be at ease; why knit your brows? If husband can become prosperous, then husband noble and children rise.',interpret:'Relax your mindset. Husband\'s midlife success lifts the family. Don\'t be anxious.'},
  '4.3':{poem:'Most intelligent in nature, gentle in dealings near benefactors; husband glorious and children noble heaven-decided, no toil needed for abundance.',interpret:'Smart and gentle, naturally noble. A destiny that boosts husband and children, enjoying lifelong peace.'},
  '4.4':{poem:'All things depend on heaven, don\'t toil bitterly; know that blessings depend on cultivation; if husband hard to satisfy in youth, old age joy when children are enfeoffed.',interpret:'Husband\'s luck mediocre in youth, children accomplished in old age. Contentment brings happiness.'},
  '4.5':{poem:'This fate\'s blessing is not light, husband capable naturally; a lifetime of glory and peace, children and grandchildren fill the hall with joy.',interpret:'Husband capable and successful, enjoying blessings from husband. Full of children and grandchildren.'},
  '4.6':{poem:'Open in all directions, change surname and move even better; husband capable endlessly, midlife and old age the same.',interpret:'Strong outward luck, move with husband. Lifelong peace and stability.'},
  '4.7':{poem:'This fate flourishes in later years, husband glorious and children noble with joy; abundant fortune throughout, wealth flowing like a fountain.',interpret:'Late years luck peaks, husband and children all prosperous. A wealthy destiny.'},
  '4.8':{poem:'Early years\' luck not yet flowing, some wasted time and poverty; husband and children ordinary, career achieved late.',interpret:'Early years hard, late years stable. Plainness is blessing. Live in peace.'},
  '4.9':{poem:'This fate\'s blessing is not light, husband glorious and children noble, prominent gate; always respected by the wealthy, enjoying glory through life.',interpret:'Helps husband and children, respected by all. Lifelong glory.'},
  '5.0':{poem:'For the family toiling daily, midlife fortune encounters trouble; old age husband noble, children in position, enjoying glory and longevity.',interpret:'Midlife hard work, blessings arrive in old age. Husband and children bring good luck.'},
  '5.1':{poem:'Lifelong glory, all matters smooth; no need for toil, all goes well; husband glorious and children noble, family accomplished with great blessings.',interpret:'Lifelong glory, noble husband and worthy children. Complete blessings.'},
  '5.2':{poem:'Lifelong smooth, everything achievable; no need for hard work, naturally accomplished; husband and children all satisfied, family abundant with joy.',interpret:'Everything goes smoothly, family blissful. A lifetime of happiness.'},
  '5.3':{poem:'This pattern brings vast blessings, helping husband and children within; lifelong food and clothing arranged, truly a blessed star on earth.',interpret:'Deep blessings, helps husband and children. Blessed star on earth, lifelong smooth.'},
  '5.4':{poem:'This fate is thick and clear, well-educated and refined in all; ample food and clothing, husband glorious, truly a blessed star on earth.',interpret:'Well-educated, husband successful. Wealthy destiny, full of good fortune.'},
  '5.5':{poem:'Whipping horse seeking fame and profit, husband\'s deeds show heroic name; one day blessings pour endlessly, husband and children shine on the gate.',interpret:'Husband successful in career, family prosperous. A noblewoman\'s destiny.'},
  '5.6':{poem:'This pattern brings mastery of propriety, lifelong fortune never exhausted; sweet and sour, bitter and spicy all tasted, rolling wealth stable and abundant.',interpret:'Masters propriety, deep blessings after weathering storms. Stable wealth.'},
  '5.7':{poem:'Fortune abundant, all things complete; husband glorious and children noble, enjoying old age; fame shakes the world, carefree like an immortal.',interpret:'Complete blessings, blissful family. Lifelong carefree, a blessed immortal fate.'},
  '5.8':{poem:'Lifelong fortune comes naturally, husband glorious and children noble, fortune and longevity together; gate prosperous, respected by all, purple robe gold belt on golden steps.',interpret:'Husband achieves fame and success, you enjoy fortune and longevity. A glorious destiny.'},
  '5.9':{poem:'Examining this pattern, elegant and clear; surely talented and all things succeed; husband and children pass examinations, whip and horse displaying power and glory.',interpret:'Your own talent outstanding, husband and children all prosper. Bringing glory to the family.'},
  '6.0':{poem:'One day quickly named on the golden list, husband glorious children noble, great vessel achieved; food and clothing surely abundant, fields and wealth even more plentiful.',interpret:'Husband and children noble, family prosperous. Lifelong wealth beyond enjoyment.'},
  '6.1':{poem:'This fate born with endless fortune, husband wealthy and noble, honoring ancestors; gold and jade fill the hall, lifelong enjoyment without end.',interpret:'Husband very wealthy and noble, enjoy glory. Full of good fortune.'},
  '6.2':{poem:'This fate born with endless fortune, husband glorious children noble, gate prominent; gold and jade fill the hall, purple robe and gold belt in peace.',interpret:'Husband at the highest position, children accomplished. Lifelong glory and peace.'},
  '6.3':{poem:'This fate brings deep blessings, husband distinguished and admired by all; gold and jewels without lack, one era of glory and peace.',interpret:'Husband prominent, richest in the land. A noblewoman\'s destiny, a lifetime of peace.'},
  '6.4':{poem:'This pattern brings new presence, helps husband and children boundlessly; lifelong wealth and nobility arranged, truly a blessed deity on earth.',interpret:'Extreme help to husband and children, boundless fortune. Destined to be a blessed deity.'},
  '6.5':{poem:'Examining this fate, the blessing is no light matter; husband glorious and children noble — who can compete? Gate illustrious, respected by all, enjoying glory through life.',interpret:'Ultimate noble lady destiny. Husband and children at highest positions, lifelong glory.'},
  '6.6':{poem:'This fate is a blessed star on earth, piled gold and jade fill the hall; husband distinguished by heaven\'s decree, enjoying glory and all success.',interpret:'Heaven-sent blessed star, husband greatly noble. Gold and jade fill the hall, a perfect life.'},
  '6.7':{poem:'This fate born with vast fortune, husband and children most exalted; lifelong ample food and clothing, one era of glory, all things smooth.',interpret:'Vast fortune, all family members prosper. Everything smooth, a lifetime of glory.'},
  '6.8':{poem:'This fate is born completely different, husband glorious and children noble within; gold and jade fill the hall without lack, enjoying glory with endless joy.',interpret:'Heaven-decreed noble fate, husband and children noble. Lifelong peace, endless blessings.'},
  '6.9':{poem:'You are the clothing and food star on earth, husband glorious children noble, admired by all; lifelong fortune heaven-decided, enjoying glory through life.',interpret:'Star of provision, husband and children all noble. Enjoy glory through life.'},
  '7.0':{poem:'This fate\'s blessing is not light, husband glorious children noble, enjoying peace; glory and wealth already heaven-decided, enjoying earthly blessings and longevity.',interpret:'Heaven-destined wealth and nobility, husband and children noble. Enjoy blessings in an era of peace.'},
  '7.1':{poem:'This fate is born completely different, husband glorious and children noble within; a lifetime of carefree fortune, ultimate wealth and glory.',interpret:'Ultimate noble fate. Husband and children at highest positions, extreme wealth and glory.'},
}

const FEMALE_JA: Record<string,{poem:string;interpret:string}> = {
  '2.1':{poem:'運命づけられて空き部屋を守り、花咲き花散りて両茫茫。一世心労して終に頼りなく、独り孤灯に向かいて時光を過ごす。',interpret:'結婚の縁薄く、一生孤独に苦しむ。身を修め養生し、縁を強請るべからず。'},
  '2.2':{poem:'寒梅独り放ち雪中に埋もれ、運命づけられて苦しみの中で耐える。終日家計のために奔波するも、老いてなお空しい。',interpret:'一生苦労して家を支えるも報われず。心を広く持ち、平穏に日々を過ごす。'},
  '2.3':{poem:'この命の福禄軽く、繍楼で織るも総て成り難し。夫や兄弟みな頼りなく、独り空閨を守りて一生を過ごす。',interpret:'六親頼りなく、夫の助力も少ない。自ら立ち自ら強く、外に頼るべからず。'},
  '2.4':{poem:'門前冷えて車馬稀に、運命づけられて福分低し。終日辛労して得るものなく、老いて孤独に誰が頼らん。',interpret:'福分浅く、老後は孤独。早めに老後の準備をし、蓄えをしておくべし。'},
  '2.5':{poem:'この命の家業微かで、終日奔波して食と衣の為。夫妻と子女みな冷淡で、独り支え持ちて日々を過ごす。',interpret:'家業凋落、家族の情薄い。一生自分だけで支える。心を平らかに。'},
  '2.6':{poem:'平生の衣禄は苦の中に求め、独り空房を守りて春秋を過ごす。もし故郷を離れ祖を去らば、老いての衣食は憂いなし。',interpret:'若年は苦労して、故郷を離れて発展するが良い。晩運は悪くなく、老後は自ずと落ち着く。'},
  '2.7':{poem:'この一生は相談少なく、夫に頼るも自ら主張し難し。独馬単槍空しく進めど、運命づけられて空き部屋を守る。',interpret:'夫の助力少なく、万事自分次第。独立して強くなることを学ぶべし。'},
  '2.8':{poem:'運命づけられて天涯を歩み、祖業は凋落して落花の如し。もし名を改め姓を変えて去らば、晚年は方って栄華を得ん。',interpret:'基盤不安定で、環境を変えるべき。改名と移住が運勢を改善する。'},
  '2.9':{poem:'若年期は運限未だ通ぜず、縱え功名有りても後日に成る。四十を過ぐるを須って立ち、他処に移居して始めて亨る。',interpret:'若年は不運も四十歳過ぎに好転。移転して発展し、晩運次第に開く。'},
  '3.0':{poem:'終日奔波苦の中に求め、東奔西走何れの日か休まん。もし终身勤倹を守らば、老いての衣食は須く憂いなし。',interpret:'一生勤労し、勤儉して家を保つ。老後は安らかで、平穏は福。'},
  '3.1':{poem:'忙忙碌碌苦の中に求め、何れの日か雲開けて日頭を見ん。辛うじて夫に頼り得て、中年の衣食漸く憂いなし。',interpret:'中年以降に運が漸く良くなり、夫の運気上昇が家運を牽引する。'},
  '3.2':{poem:'若年期は運塞がり事を謀り難く、徐々に財源が水流の如くに。中年に至り衣食豊かになり、夫の力を得て福悠悠。',interpret:'若年は苦しいが、中年に夫の事業が成功して家運も共に興る。'},
  '3.3':{poem:'早年の事は成り難く、百計徒労して心を費やす。半世は流水の如く去り、後になって運至り良人に遇う。',interpret:'若年は苦労が実らず、中年以降に良縁に恵まれ、運命好転。'},
  '3.4':{poem:'この命の福気果して軽からず、繍楼織錦様々に能くす。夫栄え子貴く家は兴旺し、老いて安らかに享受し福寿増す。',interpret:'家計を上手く切り盛りし、夫の事業成功、子女も大成。晩年は安楽に。'},
  '3.5':{poem:'平生の福量は周全ならず、祖業の根基は伝わること少なし。営みの生涯は旧を守るにしくはなく、時至れば夫貴く子は賢に登る。',interpret:'守りに徹し攻めるべからず。時期到来すれば夫や子が幸運をもたらす。'},
  '3.6':{poem:'労せずして平生を過ごし、夫栄え子貴く福軽からず。早くより福星常に命を照らし、君の行くところ百般成る。',interpret:'福星高照、夫と子を助ける命。一生順調で安楽。'},
  '3.7':{poem:'この命は般々事全し難く、夫は力少なく自ら孤怜む。祖業は微かに有るも、財は来たり去りて雲煙の如し。',interpret:'夫の助力少なく、財運は不安定。財を守り福を惜しむべし。'},
  '3.8':{poem:'一身清秀にして自ら聡明、繍楼織錦様々に精し。年に三十六に至らんとして、夫栄え子貴く安寧を享受す。',interpret:'聡明で有能、中年以降に夫や子の隆盛を享受し、幸せに暮らす。'},
  '3.9':{poem:'この命は終身運通ぜず、労して事を為すも尽く空し。夫や子も頼り難く、老いて孤独の一切は空し。',interpret:'一生辛苦して成果少なく、家族の縁薄い。心構えを調整すべし。'},
  '4.0':{poem:'平生の衣禄は長く続き、一つ一つ心の中で自ら主張す。前に風霜多く受けたれど、後に夫貴く安康を享受す。',interpret:'若年期の辛苦の後、中年に夫が発展し、それに伴い安らぐ。'},
  '4.1':{poem:'この命は推し来たって自ずから異なり、人として能くして凡庸に異なる。中年に夫貴く子は位に登り、一生安楽にして福窮まりなし。',interpret:'聡明で有能、夫と子を助ける。中年以降に福報深し。'},
  '4.2':{poem:'心を寛ろげるべきところで寛ろげ、何ぞ眉を雙皺めて開かざらん。もし夫が発達を得ば、その時夫貴く子は台に登らん。',interpret:'心を広く持ち、夫の中年発迹が家運を牽引。焦るべからず。'},
  '4.3':{poem:'人の心性最も聡明で、事を処する温良にして貴人に近し。夫栄え子貴く天の定めるところ、労せずして豊かに亨る。',interpret:'聡明で温厚、自然と気品がある。夫や子を荣えさせる命、一生安らかに享受す。'},
  '4.4':{poem:'万事天に由れ苦しみ求めるなかれ、須く福禄は人の修めに頼るを知るべし。当年の夫は意の如くならずとも、晩景欣然として子は侯に封ぜらる。',interpret:'若年は夫の運勢が平凡でも、老後に子女が大成する。足るを知れば楽しし。'},
  '4.5':{poem:'この命の福軽からず、夫は力を得て自ずから天なり。一世の栄華安らかに享受し尽くし、子や孫堂に満ちて楽しみ盈々。',interpret:'夫が有能で事業を成し、夫の福に浴する。子や孫に恵まれる。'},
  '4.6':{poem:'東西南北尽く皆通じ、姓を改め移居すれば更に隆盛。夫は力を得て窮まりなく定まり、中年の晩景も一般同じ。',interpret:'外出運が良く、夫に従い移住せよ。一生安楽で平穏。'},
  '4.7':{poem:'この命は末年が旺んと推し来たり、夫栄え子貴く自ら怡然。平生滔滔たる福有りて、財源滾滾として水泉の如し。',interpret:'晩年の運勢旺んで、夫も子も皆発達する。富貴の命。'},
  '4.8':{poem:'若年期は運道未だ通ぜず、幾許か蹉跎して命もまた窮す。夫や子は平淡なれど、一生の事業は晩に至って隆しく来たる。',interpret:'若年は苦しくも、晩年は平穏。平穏は福とし、心安らかに日を送る。'},
  '4.9':{poem:'この命の福軽からず、夫栄え子貴く門庭を顕す。從來の富貴は人も欽敬し、安らかに享受して一生を過ごす。',interpret:'夫と子を助け、人の尊敬を受ける。一生栄華を享受す。'},
  '5.0':{poem:'家の為計の為に終日労し、中年の福禄も多く遭う。老いて夫貴く子は位に登り、安らかに享受して福寿高し。',interpret:'中年は苦労すれど、晩年に福至る。夫や子が幸運をもたらす。'},
  '5.1':{poem:'一世栄華万事通じ、労せずして自ずから亨通す。夫栄え子貴く皆意の如く、家業成る時福禄宏なり。',interpret:'一世栄華、夫貴く子は賢。福禄兼ね備える命。'},
  '5.2':{poem:'一世亨通事事能くし、苦労せずして自然に成る。夫や子も皆意の如く、家業豊かに亨り喜び盈々。',interpret:'万事亨通、家庭円満。一生幸福安楽。'},
  '5.3':{poem:'この格は福沢宏かに推し来たり、夫を助け子を益することの中に在り。一生の衣食定めて安排し、却って人間の一福星。',interpret:'福沢深く、夫を助け子を益す。人間の福星、一生順調。'},
  '5.4':{poem:'この命は厚く且つ清らかと推し来たり、知書達理様々に精し。豊衣足食夫栄えて貴く、正に人間の有福星。',interpret:'知書達理、夫は発展す。富貴の命、福気満ち満ちる。'},
  '5.5':{poem:'馬を走らせ鞭を揚げて利名を争い、夫の作事は英名を顕す。一朝福禄源源として至り、夫栄え子貴く門庭を耀かす。',interpret:'夫の事業成功、家業興隆。貴婦人の命。'},
  '5.6':{poem:'この格は礼儀に通ずと推し来たり、一生の福禄は用いて窮まりなし。酸甜苦辣皆嘗め尽くし、滾滾たる財源は穩やかにして豊か。',interpret:'礼儀に通じ、辛苦を経たる後福報深し。財運は安定している。'},
  '5.7':{poem:'福禄豊かに盈ちて万事全く、夫栄え子貴く天年を楽しむ。名は揚がり威は震いて人も争い羨み、この世逍遥として仙の如し。',interpret:'福禄兼ね備え、家庭円満。一生逍遥、仙人の命。'},
  '5.8':{poem:'平生の福禄自然に来たり、夫栄え子貴く福寿偕。門庭兴旺し人も欽敬し、紫袍金帶は金階を歩む。',interpret:'夫が功成名を遂げ、自身も福寿双全。栄耀の命。'},
  '5.9':{poem:'細かに推すにこの格は秀麗にして清く、必ず才高く百事成る。夫栄え子貴く甲第に登り、鞭揚げ馬走らせ威栄を顕わす。',interpret:'自身の才能抜群、夫も子も皆発達。家門に光輝あらしめる。'},
  '6.0':{poem:'一朝金榜に快く名を題し、夫栄え子貴く大器成る。衣禄は定然として元より裕足で、田園の財帛更に豊かに盈つ。',interpret:'夫栄え子貴く、家業興隆。一生富貴、享受し尽くせず。'},
  '6.1':{poem:'この命は生まれ来て福窮まらず、夫は富貴にして親宗を顕わす。金玉堂に満ちて皆自ら得、一生安らかに享受して楽しみ窮まりなし。',interpret:'夫は大富大貴、安逸と栄華を享受す。福気満ち満ちる命。'},
  '6.2':{poem:'この命は生まれ来て福窮まらず、夫栄え子貴く門庭を顕わす。金玉堂に満ちて春尽きず、紫袍金帶に安寧を享受す。',interpret:'夫は位極めて人臣と為り、子女は大成。一生栄華安らかに享受す。'},
  '6.3':{poem:'この命の福沢深く、夫は顕貴にして衆人も欽む。金玉珍宝皆欠くることなく、一世の栄華太平を享受す。',interpret:'夫は顕赫、富ことごとくを極める。貴婦人の命、一世太平。'},
  '6.4':{poem:'この格は気象新なりと推し来たり、夫を助け子を益して福垠なし。一生の富貴定めて安排し、却って人間の一福神。',interpret:'夫と子を助けること極まり、福気限りなし。運命づけられて福神となる。'},
  '6.5':{poem:'細かに推すにこの命の福軽からず、夫栄え子貴く孰と争わん。門庭赫奕として人も欽敬し、安らかに享受してこの生を過ぐ。',interpret:'極上の貴婦人の命。夫も子も位極めて人臣と為り、一生栄耀。'},
  '6.6':{poem:'この命は人間の一福星、金を積み玉を堆して満堂春。夫の顕貴は天の定めるところ、安らかに享受して万事成る。',interpret:'天よりの福星、夫は大貴。金玉堂に満ち、一生円満。'},
  '6.7':{poem:'この命は生まれ来て福自ら宏く、夫や子最も高隆。平生衣禄豊かに盈ち足り、一世の栄華万事通ず。',interpret:'福運宏大、家族みな発達。万事亨通、一世の栄華。'},
  '6.8':{poem:'この命は生成大いに同じからず、夫栄え子貴くの中に在り。金玉堂に満ちて皆欠くることなく、安らかに享受して楽しみ窮まりなし。',interpret:'天定の貴命、夫栄え子貴い。一生安楽、福気窮まりなし。'},
  '6.9':{poem:'君は人間の衣禄星、夫栄え子貴く衆人も欽む。一生の福禄は天の定めるところ、安らかに享受して一生を過ぐ。',interpret:'衣禄の星、夫も子も皆貴い。安らかに享受して一生を過ごす。'},
  '7.0':{poem:'この命の福軽からず、夫栄え子貴く太平を享受す。栄華富貴已に天の定め、安らかに人間の福寿寧を享受す。',interpret:'天命の富貴、夫栄え子貴い。太平の世に福を享受する命。'},
  '7.1':{poem:'この命は生成大いに同じからず、夫栄え子貴くの中に在り。一生自ら逍遥の福有り、富貴栄華極品の隆。',interpret:'極品の貴命。夫と子、みな位極めて人臣と為り、富貴至極。'},
}

const FEMALE_KO: Record<string,{poem:string;interpret:string}> = {
  '2.1':{poem:'운명지어져 빈방을 지키고, 꽃피고 꽃지고 두루 아득히. 일생 마음 괴로워도 끝내 의지할 데 없고, 홀로 등불 마주하며 세월을 보낸다.',interpret:'혼인 인연이 얇아 일생 고독하다. 몸과 마음을 닦고, 인연을 억지로 구하지 말라.'},
  '2.2':{poem:'한매(寒梅) 홀로 피어 눈 속에 파묻히고, 운명지어져 괴로움 속에서 견딘다. 종일 가계를 위해 분주해도 늙어서는 여전히 빈손.',interpret:'일생 고생하며 집을 꾸리지만 보답이 적다. 마음을 넓게 가지고 평범하게 살아가라.'},
  '2.3':{poem:'이 명(命)은 복록이 가벼워, 수루에서 비단 짜도 끝내 이루기 어렵다. 지아비와 형제 모두 의지할 데 없어, 홀로 빈규를 지키며 일생을 보낸다.',interpret:'육친 의지할 데 없고, 지아비의 도움도 적다. 스스로 일어나 강해지고, 밖에 의지하지 말라.'},
  '2.4':{poem:'문전이 쓸쓸하고 수레와 말 드물며, 운명지어져 복분이 낮다. 종일 고생해도 얻는 것 없고, 늙어 외로우면 누가 의지하랴.',interpret:'복분이 얇고, 노후는 고독하다. 일찍 노후를 준비하고, 비축해 두라.'},
  '2.5':{poem:'이 명의 가업이 미미하여, 종일 분주히 먹고 입을 것을 구한다. 지아비와 자녀 모두 냉담하여, 홀로 떠받치며 나날을 보낸다.',interpret:'가업은 기울고, 가족의 정이 얇다. 일생 자신만으로 떠받친다. 마음을 평온히 하라.'},
  '2.6':{poem:'평생 의식은 고통 속에서 구하고, 홀로 빈방을 지키며 춘추를 보낸다. 만약 고향을 떠나 조상을 떠나면, 늙어 의식 걱정 없으리라.',interpret:'젊은 시절 고생하고, 고향 떠나 발전하는 것이 좋다. 만년의 운은 괜찮고, 늙으면 저절로 자리가 잡힌다.'},
  '2.7':{poem:'이 일생은 상의가 적고, 지아비 의지해도 스스로 주장하기 어렵다. 필마단창 공허히 나아가도, 운명지어져 빈방을 지킨다.',interpret:'지아비의 도움 적고, 모든 일이 자신에게 달렸다. 독립하여 강해지는 법을 배워라.'},
  '2.8':{poem:'운명지어져 천애를 걷고, 조업은 시들어 떨어진 꽃과 같다. 만약 이름과 성을 바꿔 떠나면, 만년에 바야흐로 영화를 얻으리.',interpret:'기반이 불안정하여 환경을 바꾸어야 한다. 개명과 이주가 운세를 개선한다.'},
  '2.9':{poem:'젊은 시절에는 아직 운이 트이지 않고, 공명이 있다 해도 후일에 이룬다. 마흔을 넘어야 비로소 설 수 있고, 타처로 이거하여 비로소 형통하리.',interpret:'젊은 시절 불운도 마흔 이후 좋아진다. 이전하여 발전하고, 만년의 운이 점차 트인다.'},
  '3.0':{poem:'종일 분주 고통 속에서 구하고, 동분서주 어느 날에 쉴까. 만약 종신토록 근검을 지키면, 늙어 의식 걱정 없으리라.',interpret:'일생 근면, 검소하게 집안을 꾸린다. 노후는 편안하고, 평범함이 복이다.'},
  '3.1':{poem:'분주하고 고통 속에서 구하며, 어느 날에 구름 걷히고 해를 보려나. 간신히 지아비 의지할 수 있어, 중년 의식 점차 걱정 없다.',interpret:'중년 이후 점차 운이 좋아지고, 지아비의 운기 상승이 가운을 이끈다.'},
  '3.2':{poem:'젊은 시절 운이 막혀 일을 꾀하기 어렵고, 점차 재원이 흐르는 물과 같다. 중년에 이르러 의식 풍족하고, 지아비 덕에 복이 끝없다.',interpret:'젊은 시절 고생하지만, 중년에 지아비 사업 성공하여 가운도 함께 일어난다.'},
  '3.3':{poem:'젊은 시절 일 이루기 어렵고, 백 가지 계획 헛되어 마음을 소비한다. 반생은 흐르는 물처럼 가고, 후에 운이 이르러 좋은 사람 만나리.',interpret:'젊은 시절 고생하여도 열매 없지만, 중년 이후 좋은 인연 만나 운명이 좋아진다.'},
  '3.4':{poem:'이 명의 복기 과연 가볍지 않아, 수루에서 비단 짜기 모두 능숙하다. 지아비 영화롭고 자녀 귀하여 가문이 번창하고, 늙어 편안히 누리며 복수 더한다.',interpret:'집안 살림을 잘 꾸리고, 지아비 사업 성공, 자녀도 대성한다. 만년은 안락하다.'},
  '3.5':{poem:'평생 복량은 완전하지 않고, 조업의 기초는 전해짐이 적다. 영업의 생애는 옛것을 지키는 것만 못하고, 때 이르면 지아비 귀하고 자녀 현명해진다.',interpret:'수비에 치중하고 공격하지 말라. 시기가 오면 지아비와 자녀가 행운을 가져온다.'},
  '3.6':{poem:'수고 없이 평생을 보내고, 지아비 영화롭고 자녀 귀하여 복이 가볍지 않다. 일찍부터 복성이 항상 명을 비추고, 그대 가는 곳 모든 일 이루리.',interpret:'복성이 높이 비추어, 지아비와 자녀를 돕는 명이다. 일생 순조롭고 안락하다.'},
  '3.7':{poem:'이 명은 모든 일 완전하기 어렵고, 지아비 힘 적어 스스로 가련하다. 조업은 약간 있으나, 재물 왔다 갔다 연기와 같다.',interpret:'지아비의 도움 적고, 재운이 불안정하다. 재물 지키고 복을 아껴라.'},
  '3.8':{poem:'일신이 청수하고 스스로 총명하여, 수루에서 비단 짜기 모두 정교하다. 나이 서른여섯에 이르러, 지아비 영화롭고 자녀 귀하여 안녕 누리리.',interpret:'총명하고 유능하며, 중년 이후 지아비와 자녀의 융성을 누리며 행복하게 산다.'},
  '3.9':{poem:'이 명은 종신토록 운이 통하지 않고, 수고로 일해도 모두 허사다. 지아비와 자녀도 의지하기 어렵고, 늙어 외로워 모든 것이 허무하다.',interpret:'일생 고생해도 성과 적고, 가족 인연이 얇다. 마음가짐을 조정하라.'},
  '4.0':{poem:'평생 의식은 길게 이어지고, 한 가지 한 가지 마음속에 스스로 주장 있다. 앞에 풍상 많이 겪었으나, 후에 지아비 귀하여 강녕 누리리.',interpret:'젊은 시절 고생한 후, 중년에 지아비 발전하여 함께 편안해진다.'},
  '4.1':{poem:'이 명은 미루어보아 스스로 다르고, 사람으로서 유능하여 평범과 다르다. 중년에 지아비 귀하고 자녀 벼슬에 올라, 일생 안락하고 복 끝없다.',interpret:'총명하고 유능하여 지아비와 자녀를 돕는다. 중년 이후 복보가 깊다.'},
  '4.2':{poem:'마음 느긋할 때는 느긋하라, 어찌 두 눈썹을 찌푸리며 펴지 않으리. 만약 지아비가 발전을 얻으면, 그때 지아비 귀하고 자녀 오르리라.',interpret:'마음을 넓게 가져라. 지아비 중년 발적이 가운을 이끈다. 조급해하지 말라.'},
  '4.3':{poem:'사람의 심성이 가장 총명하고, 일 처리 온량하여 귀인에 가깝다. 지아비 영화롭고 자녀 귀한 것은 하늘의 뜻, 수고 없이 풍성히 누리리.',interpret:'총명하고 온후하여 자연히 기품 있다. 지아비와 자녀를 영화롭게 하는 명, 일생 안락히 누린다.'},
  '4.4':{poem:'만사 하늘에 맡기고 괴로이 구하지 말라, 복록은 사람의 닦음에 달렸음을 알아야 한다. 당년 지아비 뜻대로 안 되어도, 만년 기쁘게 자녀가 제후에 봉해지리라.',interpret:'젊어 지아비 운세 평범해도, 노후에 자녀가 대성한다. 족함을 알면 즐거우니라.'},
  '4.5':{poem:'이 명의 복이 가볍지 않아, 지아비 힘 얻어 자연히 하늘 뜻이라. 일생 영화 편안히 누리고, 자손이 집에 가득하여 즐거움 넘친다.',interpret:'지아비 유능하여 사업 이루고, 지아비의 복을 누린다. 자손이 번성하다.'},
  '4.6':{poem:'동서남북 모두 통하고, 성을 바꾸고 이거하면 더욱 융성. 지아비 힘 얻어 끝없이 정해지고, 중년의 만년도 일반으로 같다.',interpret:'외출운 좋아, 지아비 따라 이주하라. 일생 안락하고 평온하다.'},
  '4.7':{poem:'이 명은 만년에 왕성하리라 미루어지고, 지아비 영화롭고 자녀 귀하여 스스로 즐겁다. 평생 넘치는 복이 있고, 재원이 솟구쳐 샘물과 같다.',interpret:'만년 운세 왕성하여 지아비와 자녀 모두 발달한다. 부귀의 명이다.'},
  '4.8':{poem:'젊은 시절 운도 아직 통하지 않고, 얼마간 좌절하며 운도 또한 궁하다. 지아비와 자녀는 평범하나, 일생 사업은 늦게 융성히 오리라.',interpret:'젊은 시절 고생하나, 만년은 평온하다. 평온함이 복, 마음 편히 나날을 보내라.'},
  '4.9':{poem:'이 명의 복이 가볍지 않아, 지아비 영화롭고 자녀 귀하여 문정을 드러낸다. 예부터 부귀는 사람도 흠모하고, 편안히 누리며 일생을 보낸다.',interpret:'지아비와 자녀를 돕고, 사람의 존경을 받는다. 일생 영화를 누린다.'},
  '5.0':{poem:'집을 위해 계를 위해 종일 수고하고, 중년의 복록도 많이 겪는다. 늙어 지아비 귀하고 자녀 벼슬에 올라, 편안히 누리며 복수 높다.',interpret:'중년 수고해도 만년에 복 이른다. 지아비와 자녀가 행운을 가져온다.'},
  '5.1':{poem:'일세 영화 만사 통하고, 수고 없이 스스로 형통한다. 지아비 영화롭고 자녀 귀하여 모두 뜻대로, 가업 이룰 때 복록 크다.',interpret:'일세 영화, 지아비 귀하고 자녀 어질다. 복록 겸비한 명이다.'},
  '5.2':{poem:'일세 형통 만사 능히 하고, 고생 없이 자연히 이룬다. 지아비와 자녀 모두 뜻대로, 가업 풍성하고 기쁨 넘친다.',interpret:'만사 형통, 가정 원만. 일생 행복 안락하다.'},
  '5.3':{poem:'이 격은 복택이 크게 미루어져, 지아비 돕고 자녀 이롭게 함이 그 속에 있다. 일생 의식 정해져 배치되고, 바로 인간의 한 복성(福星)이다.',interpret:'복택이 깊어, 지아비 돕고 자녀 이롭게 한다. 인간의 복성, 일생 순조롭다.'},
  '5.4':{poem:'이 명은 후하고 또한 맑다 미루어져, 글을 알고 예에 통달하고 모두 정교하다. 풍요 의복에 지아비 영화로워, 바로 인간의 복성(福星)이다.',interpret:'글 알고 예에 통달하고, 지아비는 발전한다. 부귀의 명, 복기 가득하다.'},
  '5.5':{poem:'말 달리고 채찍 들어 이익과 명예 다투고, 지아비의 일이 영웅 이름 드러낸다. 하루아침 복록 샘솟듯 이르러, 지아비 영화롭고 자녀 귀하여 문정 빛낸다.',interpret:'지아비 사업 성공, 가업 흥륭하다. 귀부인의 명이다.'},
  '5.6':{poem:'이 격은 예의에 통한다 미루어져, 일생 복록 다함이 없이 쓰리라. 신고달콤 씀바늘 다 맛보고, 넘치는 재원은 안정되고 풍성하다.',interpret:'예의에 통하고, 고생 겪은 뒤 복보가 깊다. 재운이 안정적이다.'},
  '5.7':{poem:'복록 풍성히 넘쳐 만사 완전하고, 지아비 영화롭고 자녀 귀하여 천년을 즐긴다. 이름 떨치고 위엄 떨쳐 사람들 다투어 부러워하고, 이 세상 소요하기가 신선과 같다.',interpret:'복록 겸비, 가정 원만. 일생 소요, 신선의 명이다.'},
  '5.8':{poem:'평생 복록 자연히 오고, 지아비 영화롭고 자녀 귀하여 복수 함께한다. 문정 흥왕하고 사람도 흠모하며, 자포금대가 금계를 걷는다.',interpret:'지아비 공명 이루고, 자신도 복수 쌍전하다. 영화의 명이다.'},
  '5.9':{poem:'자세히 미루어 이 격은 수려하고 맑아, 반드시 재주 높아 모든 일 이룬다. 지아비 영화롭고 자녀 귀하여 갑과에 오르고, 채찍 들어 말 달리며 위엄과 영화 드러낸다.',interpret:'자신의 재주 탁월하고, 지아비와 자녀 모두 발달한다. 가문에 광채를 드리운다.'},
  '6.0':{poem:'하루아침 금방에 이름 올리고, 지아비 영화 자녀 귀하여 대기 이룬다. 의식 정해져 원래 넉넉하고, 전원의 재백 더욱 풍성히 넘친다.',interpret:'지아비와 자녀 귀하고, 가업 흥륭하다. 일생 부귀, 누리기에 끝없다.'},
  '6.1':{poem:'이 명은 나면서 복이 다함없고, 지아비 부귀하여 친종을 빛낸다. 금옥 당에 가득해 모두 스스로 얻고, 일생 편안히 누리며 즐거움 끝없다.',interpret:'지아비 대부대귀, 편안히 영화를 누린다. 복기 가득한 명이다.'},
  '6.2':{poem:'이 명은 나면서 복이 다함없고, 지아비 영화 자녀 귀하여 문정을 빛낸다. 금옥 당에 가득해 봄이 다함없고, 자포금대에 안녕을 누린다.',interpret:'지아비 위극인신, 자녀 대성한다. 일생 영화 편안히 누린다.'},
  '6.3':{poem:'이 명의 복택이 깊고, 지아비 빛나고 귀하여 여러 사람 흠모한다. 금옥 진귀한 보배 모두 빠짐없고, 일세 영화 태평을 누린다.',interpret:'지아비 빛나고, 부를 극진히 누린다. 귀부인의 명, 일세 태평.'},
  '6.4':{poem:'이 격은 기상 새롭다 미루어져, 지아비 돕고 자녀 이롭게 하여 복이 끝없다. 일생 부귀 정해져 배치되고, 바로 인간의 한 복신(福神)이다.',interpret:'지아비 자녀 돕는 일이 지극하고, 복기 한없다. 운명지어져 복신이 된다.'},
  '6.5':{poem:'자세히 미루어 이 명의 복이 가볍지 않아, 지아비 영화 자녀 귀하여 누가 다투리. 문정 혁혁하고 사람들 흠모하여, 편안히 누리며 이 생을 보낸다.',interpret:'극상 귀부인의 명. 지아비와 자녀 모두 위극인신, 일생 영화.'},
  '6.6':{poem:'이 명은 인간의 한 복성, 금 쌓고 옥 쌓아 만당 봄. 지아비 빛나고 귀함은 하늘의 뜻, 편안히 누리며 만사 이룬다.',interpret:'하늘의 복성, 지아비 대귀. 금옥 당에 가득, 일생 원만히 끝난다.'},
  '6.7':{poem:'이 명은 나면서 복이 스스로 크고, 지아비와 자녀 가장 높이 융성하다. 평생 의식 풍성히 넉넉하고, 일세 영화 만사 통한다.',interpret:'복운 거대, 가족 모두 발달한다. 만사 형통, 일세 영화.'},
  '6.8':{poem:'이 명은 생성 크게 같지 않아, 지아비 영화 자녀 귀함이 그 속에 있다. 금옥 당에 가득해 모두 빠짐없고, 편안히 누리며 즐거움 끝없다.',interpret:'천정의 귀명, 지아비 영화 자녀 귀하다. 일생 편안하고 복기 다함없다.'},
  '6.9':{poem:'그대는 인간의 의록성(衣祿星), 지아비 영화 자녀 귀하여 여러 사람 흠모한다. 일생 복록은 하늘의 정한 바, 편안히 누리며 일생을 보낸다.',interpret:'의록의 별, 지아비와 자녀 모두 귀하다. 편안히 누리며 일생 보낸다.'},
  '7.0':{poem:'이 명의 복이 가볍지 않아, 지아비 영화 자녀 귀하여 태평 누린다. 영화 부귀 이미 하늘의 뜻, 편안히 인간 복수녕을 누린다.',interpret:'천명 부귀, 지아비 영화 자녀 귀하다. 태평 세상에 복을 누리는 명.'},
  '7.1':{poem:'이 명은 생성 크게 같지 않아, 지아비 영화 자녀 귀함이 그 속에 있다. 일생 스스로 소요의 복 있고, 부귀 영화 극품의 높음.',interpret:'극품 귀명. 지아비와 자녀 모두 위극인신, 부귀 지극하다.'},
}

const MALE_KO: Record<string,{poem:string;interpret:string}> = {}

// ── Locale Data Map ──
const LEVEL_MAP: Record<string, Record<string, string>> = { en: LEVEL_EN, ja: LEVEL_JA, ko: LEVEL_KO }
const FORTUNE_MAP: Record<string, Record<string, Record<string, {poem:string;interpret:string}>>> = {
  male: { en: MALE_EN, ja: MALE_JA_FIXED, ko: MALE_KO },
  female: { en: FEMALE_EN, ja: FEMALE_JA, ko: FEMALE_KO },
}

function getLevel(level: string, locale: string): string {
  return LEVEL_MAP[locale]?.[level] || level
}

function getFortune(gender: string, key: string, locale: string): Fortune {
  const d = FORTUNE_MAP[gender]
  const base = gender === 'male' ? MALE : FEMALE
  if (d && d[locale] && d[locale][key]) {
    const loc = d[locale][key]
    return { poem: loc.poem, interpret: loc.interpret, level: getLevel((base[key]?.level || '中平'), locale) }
  }
  const fb = base[key]
  if (fb) return { ...fb, level: getLevel(fb.level, locale) }
  return { poem: '', interpret: '', level: 'Average' }
}

// ═══════════ 命书分析 ═══════════
interface MingShu { overview: string; personality: string; marriage: string; career: string; wealth: string; health: string; tips: string }

const MINGSHU_MAP: Record<string, Record<string, MingShu>> = {
  en: {
    upper: { overview:'This bone weight is extraordinary — deep-rooted, a dragon among men. Lifelong ample provisions, fame and fortune both gained, with longevity complete. Especially prosperous in later years. A noble destiny beyond the ordinary.', personality:'Resolute and decisive, extraordinary bearing with leadership style. Upright and generous, handles matters decisively. Strong self-esteem, doesn\'t easily admit defeat — may offend others. Learn to moderate sharp edges and build good relationships.', marriage:'Auspicious marriage with a virtuous spouse and harmonious family. Good异性缘 (opposite-sex appeal), easily find a helpful spouse. Family prospers after marriage, children accomplished. Late marriage better but early marriage also fine.', career:'Very strong career luck — suitable for politics or business. Leadership ability suited for management or entrepreneurship. Career soars after midlife, fame and profit both.', wealth:'Prosperous wealth luck — both regular and windfall wealth strong. Good at investment and business. Wealth flows after midlife. Plan asset allocation wisely.', health:'Good health with abundant energy. Watch diet and avoid overwork. Regular check-ups. Focus on cardiovascular health in later years.', tips:'This is a noble destiny with deep heaven-sent blessings. Win people with virtue and kindness for even greater blessings. Engage in charity to solidify fortune. Beware of pride and arrogance.' },
    midgood: { overview:'This bone weight is above average — solid foundation. Stable life with more than enough. Not a destiny of extreme wealth, but deep blessings and ample provisions. Fortune improves after midlife. Be diligent and patient for good returns.', personality:'Practical and steady, works in an organized manner. Reliable and sincere. Not a standout but wins through diligent persistence, progressing step by step.', marriage:'Stable marriage with a loyal and honest spouse. Harmonious family. Late marriage benefits career. Wealth improves after marriage. Treat each other with sincerity.', career:'Above-average career luck — choose a stable industry and dig deep. Not suitable for frequent job changes. Focus on one field for achievement. Career improves after midlife.', wealth:'Steadily rising wealth — invest conservatively. Not suitable for high-risk investments. Focus on regular income. Accumulation becomes significant after midlife.', health:'Generally healthy with occasional minor ailments. Maintain regular routine and exercise. Pay attention to digestion and liver/gallbladder health.', tips:'This is an above-average destiny. Be diligent and enterprising for returns after midlife. Build good relationships and network. Beware of hesitation and missed opportunities.' },
    mid: { overview:'This bone weight is balanced — steady foundation. Needs personal effort throughout life, cannot rely on others. Some early-life twists, improvement after midlife. Contentment brings happiness — peace is blessing.', personality:'Gentle and kind, approachable. Conscientious and responsible. Runs the household well. Though not showy, family life is harmonious and happy. Broaden horizons and try new things.', marriage:'Marriage requires patience from both sides. Early感情 (romance) fortune average, stabilizes after midlife. Communicate more and avoid impulsive arguments.', career:'Career requires diligent management. Don\'t aim too high. Choose practical work to accumulate experience and resources. Can try entrepreneurship after midlife.', wealth:'Average wealth — live within means. Don\'t lend money or invest blindly. Focus on stability and accumulate slowly.', health:'Constitution slightly weak, easily fatigued. Strengthen exercise and build up health. Watch for seasonal changes and common illnesses.', tips:'This is a balanced destiny — stable throughout. Be down-to-earth and accumulate slowly. Avoid rushing. Good deeds improve luck.' },
    lower: { overview:'This bone weight is light — thin foundation. A life of much hard work and wandering, fortune fluctuating greatly. Accumulate virtue to increase blessings. Don\'t aim too high — steady work is best.', personality:'Stubborn and introverted, not easy to open up. Prefers working alone, not good at leveraging help. Broaden mindset, make good friends, build network to improve luck.', marriage:'Marriage luck is weak. Better to marry late to avoid twists. Choose spouse carefully, don\'t rush. Practice tolerance for lasting relationships.', career:'Career luck weak — stick to stable employment. Not suitable for entrepreneurship. Rely on others for development. Work diligently and accumulate.', wealth:'Wealth luck weak — budget carefully. Not suitable for investment. Rely on stable job income. Avoid lending and guarantees to prevent losses.', health:'Constitution weak — need more care. Sleep and wake early, eat lightly. Watch cardiovascular and digestive health.', tips:'This destiny is light. Accept fate and go with the flow. Do more good deeds to increase blessings. Never blame fate. The root of changing destiny lies in accumulating virtue.' },
  },
  ja: {
    upper: { overview:'この骨格は群を抜いており、根基は深く、人中の竜鳳の相。一生衣食豊かに、名利ともに収め、福禄壽揃い、晩年は特に昌隆。貴くして言葉に尽くせぬ格。', personality:'性格は剛毅果断、気度非凡で、リーダーシップがある。正直で豪放、決断力があり大将の風格。自尊心が強く、簡単に負けを認めないゆえ、小人を怒らせやすい。適度に角を収め、広く良縁を結ぶべし。', marriage:'結婚は順調で、配偶者は賢良。夫婦心を同じくす。異性運良く、賢妻の助けを得やすい。結婚後、家運は隆盛、子女も大成。晩婚がより良く、早婚も可。', career:'事業運は極めて旺んで、政治か商業に従事するに適す。リーダーシップがあり、管理職や自主創業に適す。中年後、事業は飛躍し、名利ともに収む。', wealth:'金運は亨通し、正財偏財とも旺ん。資産運用や投資に長け、商才がある。中年后、財源滾滾。資産配置を合理的に計画すべし。', health:'身体は健康で精力は充沛。飲食に節度を以てし、過度な労務を避くべし。定期検診で未然に防ぐ。晩年は心血管の養生に注意。', tips:'この命は貴格、天の福沢深し。徳を以て人に服し、恩を施せば福報更に増す。公益慈善に従事し、徳を積んで福報を固むべし。傲慢を戒め、謙虚であれ。' },
    midgood: { overview:'この骨格は中上、根基はしっかりしており、一生安穩にして有余あり。大富大貴ではないが、福沢深く、衣食に乏しからず。中年後、運勢は次第に佳境に入る。勤勉に守りを固めれば、必ず厚い報いがある。', personality:'性格は務実で穩やか、事をなすに条理あり。誠実で信頼でき、責任感がある。尖ったところはないが、着実に努力し、順を追って進み、ついに成すところあり。', marriage:'婚姻は平穩、配偶者は忠厚で賢良。夫婦関係は融洽、家庭は和睦。晩婚は仕事に更に有利。結婚後、金運次第に旺む。真心で以て相対し、因縁を大切にせよ。', career:'事業運は中上、安定した業界を選び深耕すべし。頻繁な転職に適さず、一行に専念すれば必ず成就あり。中年後、事業は次第に佳境に入る。', wealth:'金運は穩やかに上昇、穩健な資産運用が宜しい。高リスク投資に適さず、正財収入を主とする。中年後、金運次第に旺んで蓄え観るべきものあり。', health:'身体は基本的に健康、時に微恙あり。規則正しい生活と適度な運動を心掛け、胃腸と肝膽の養生に注意せよ。', tips:'この命は中上、勤奮に進取し、中年後自ずから報いあり。広く良縁を結び、人脈を積むべし。ただし畏首畏尾、好機を逃すことなかれ。' },
    mid: { overview:'この骨格は中正、根基は平穩。一生自身の努力が必要で、他人に頼るべからず。早年には曲折があるも、中年後に好転を見る。足るを知れば楽しみ、平安は福。', personality:'性格は溫和善良、人に親しみやすい。事をなすに真面目で責任感あり。家を治めるに方あり。派手ではないが、家庭は円満で幸福。外の世界に目を向け、新しきことに挑戦せよ。', marriage:'婚姻はやや平淡、双方の努力が必要。早年の感情運は普通、中年後に漸く安定。多く溝通し理解し合い、感情に任せて事をなすべからず。', career:'事業は勤勉に經營すべし。高望みすべからず。務実な仕事を選び、経験と資源を積む。中年後、創業を試みるも可。', wealth:'金運は平凡、収入に応じて支出を制すべし。人に金を貸すべからず、又盲目的な投資も避く。穩やかを主とし、積少して多と為す。', health:'体質はやや弱く、疲れやすい。鍛錬を加強し、体質を増強せよ。季節の変化に注意し、風邪などの常見病を防げ。', tips:'この命は中和、一生平穩。地に足つけて歩み、厚く積んで薄く発つべし。急いで速を求めるべからず。良いことを多く行えば運勢は改善す。' },
    lower: { overview:'この骨格は軽く、根基が薄い。一生多く勞碌奔波し、運勢の起伏が大きい。徳を積み善を行い福報を増すべし。高望みせず、着実に事を為すを上策とす。', personality:'性格は頑固で内向的、人と心を開き難い。事を独りで行い、外の力を借りるのが下手。心を広げ、良き朋友を多く作り、人脈を以て運を助くべし。', marriage:'婚姻運はやや弱く、晩婚を以て曲折を避くべし。配偶者選びは慎重に、軽率にすべからず。結婚後は互いに包容し、長く続くを要す。', career:'事業運はやや弱く、安分に穩健な仕事をすべし。創業に適さず、他人に依って発展すべし。勤勉に働き、積み重ねを主とせよ。', wealth:'金運はやや弱く、入念に計算すべし。投資や理財に適さず、正職の穩やかな収入を主とす。借金や保証を避け、破財を謹め。', health:'体質は弱く、多く養生を要す。早寝早起き、飲食は淡泊に節度あり。心脳血管と消化器系の健康に注意せよ。', tips:'この命の骨は軽し。天命を知り、自然に任せよ。多くの善事を為せば福報を増す。天を怨み人を尤むるを戒めよ。命運を変える根本は徳を積み善を行い、自ら強く息まざることにある。' },
  },
  ko: {
    upper: { overview:'이 골격은 뛰어나 기초가 깊습니다. 인간 중의 용봉(龍鳳)의 상입니다. 일생 의복이 풍부하고 명예와 이익을 모두 얻으며 복록수(福祿壽)를 갖추고 만년이 특히 창성합니다. 귀하여 말로 다할 수 없는 격입니다.', personality:'강직하고 과단성 있으며 기도가 비범하고 리더십이 있습니다. 정직하고 호탕하며 결단력이 있고 대장의 풍모가 있습니다. 자존심이 강해 쉽게 패배를 인정하지 않아 소인배의 미움을 사기 쉽습니다. 적당히 날을 세우지 말고 인연을 넓게 맺어야 합니다.', marriage:'결혼이 순조롭고 배우자가 현명하며 부부가 마음을 같이합니다. 이성운이 좋아 현명한 아내의 도움을 얻기 쉽습니다. 결혼 후 가운이 융성하고 자녀도 대성합니다.', career:'사업운이 매우 왕성하여 정치나 상업에 종사하기 좋습니다. 리더십이 있어 관리직이나 자영업에 적합합니다. 중년 이후 사업이 비약하고 명예와 이익을 모두 얻습니다.', wealth:'재운이 형통하고 정재와 편재 모두 왕성합니다. 자산 운용과 투자에 능숙하고 상업적 재능이 있습니다. 중년 이후 재원이 넘칩니다.', health:'건강하고 정력이 충만합니다. 음식에 절도 있고 과로를 피해야 합니다. 정기 검진으로 예방하고 만년에는 심혈관 건강에 주의합니다.', tips:'이 명은 귀격으로 하늘의 복택이 깊습니다. 덕으로 사람을 감복시키고 은혜를 베풀면 복보가 더욱 늘어납니다. 자선 활동에 종사하고 덕을 쌓아 복을 굳게 하십시오. 교만을 경계하고 겸손해야 합니다.' },
    midgood: { overview:'이 골격은 중상으로 기초가 튼튼하여 일생 안정되고 여유가 있습니다. 크게 부귀하지는 않지만 복택이 깊고 의식이 부족하지 않습니다. 중년 이후 운세가 점차 좋아집니다. 부지런히 지키면 반드시厚報가 있습니다.', personality:'실용적이고 차분하며 일을 함에 조리가 있습니다. 성실하고 믿음직스러우며 책임감이 있습니다. 뾰족하지는 않지만 착실히 노력하여 단계적으로 나아가 결국 성과를 냅니다.', marriage:'결혼은 평온하고 배우자는 충실하고 현명합니다. 부부 관계는 융화되고 가정은 화목합니다. 만혼이 일에 더 유리합니다. 결혼 후 재운이 점차 좋아집니다.', career:'사업운은 중상, 안정된 업종을 선택하여 깊이 파고들어야 합니다. 잦은 이직에 적합하지 않고 한 가지에 전념하면 반드시 성취가 있습니다.', wealth:'재운은 안정적으로 상승하며 안정적인 자산 운용이 좋습니다. 고위험 투자에 적합하지 않고 정재 수입을 주로 합니다. 중년 이후 재운이 점차 좋아집니다.', health:'기본적으로 건강하나 가끔 가벼운 병이 있습니다. 규칙적인 생활과 적당한 운동을 하고 위장과 간담 건강에 주의합니다.', tips:'이 명은 중상, 부지런히 나아가면 중년 이후 저절로 보답이 있습니다. 널리 좋은 인연을 맺고 인맥을 쌓으십시오. 그러나 우물쭈물하며 기회를 놓치지 마십시오.' },
    mid: { overview:'이 골격은 중화로 기초가 평온합니다. 일생 자신의 노력이 필요하고 타인에게 의지할 수 없습니다. 젊은 시절에 굴곡이 있으나 중년 이후 호전을 봅니다. 족함을 알면 즐겁고 평안함이 복입니다.', personality:'온화하고 선량하며 사람에게 친근감 있습니다. 성실하고 책임감 있으며 집을 잘 꾸립니다. 화려하지는 않지만 가정은 원만하고 행복합니다. 외부 세계에 눈을 돌리고 새로운 것에 도전하십시오.', marriage:'결혼은 양측의 노력이 필요합니다. 조년 감정운은 보통이고 중년 이후 점차 안정됩니다. 많이 소통하고 이해하며 감정적으로 행동하지 마십시오.', career:'사업은 부지런히 경영해야 합니다. 높은 이상보다는 실용적인 일을 선택하여 경험과 자원을 쌓습니다.', wealth:'재운은 평범하여 수입에 맞춰 지출해야 합니다. 남에게 돈을 빌려주거나 맹목적 투자는 피하십시오. 안정을 위주로 조금씩 모읍니다.', health:'체질이 약간 약하여 피로하기 쉽습니다. 운동을 강화하고 체질을 증진하십시오. 계절 변화를 주의하고 감기 같은 흔한 병을 예방합니다.', tips:'이 명은 중화, 일생 평온합니다. 발을 땅에 딛고 걸으며 두텁게 쌓아 얇게 발산하십시오. 급하게 빠름을 구하지 마십시오. 선행을 많이 하면 운세가 개선됩니다.' },
    lower: { overview:'이 골격은 가벼워 기초가 얇습니다. 일생 고생과 분주함이 많고 운세의 기복이 큽니다. 덕을 쌓고 선행을 하여 복보를 늘리십시오. 높은 이상보다는 착실히 일하는 것이 상책입니다.', personality:'완고하고 내향적이며 사람과 마음을 열기 어렵습니다. 혼자 일하고 외부의 힘을 빌리는 데 서툽니다. 마음을 넓히고 좋은 벗을 많이 만들어 인맥으로 운을 돕게 하십시오.', marriage:'혼인운이 약하니 만혼으로 굴곡을 피하십시오. 배우자 선택은 신중히 하고 경솔히 하지 마십시오. 결혼 후 서로 포용하고 오래 지속해야 합니다.', career:'사업운이 약하니 안정적인 직업을 유지하십시오. 창업에 적합하지 않고 타인에 의존하여 발전하십시오. 부지런히 일하고 축적을 위주로 하십시오.', wealth:'재운이 약하니 세심히 계획하십시오. 투자에 적합하지 않고 정직의 안정 수입을 주로 하십시오. 빚이나 보증을 피하고 파재를 막으십시오.', health:'체질이 약하니 많은 양생이 필요합니다. 일찍 자고 일찍 일어나고 음식은 담백하게 하십시오. 심뇌혈관과 소화기계 건강에 주의하십시오.', tips:'이 명의 뼈는 가볍습니다. 천명을 알고 자연에 맡기십시오. 많은 선행을 하면 복보를 늘립니다. 하늘을 원망하고 사람을 탓하지 마십시오. 운명을 바꾸는 근본은 덕을 쌓고 선행을 하며 스스로 강해지는 데 있습니다.' },
  },
}
// zh-CN base for mingShu
function getMingShuLevel(total: number): string {
  if (total >= 5.0) return 'upper'
  if (total >= 4.0) return 'midgood'
  if (total >= 3.5) return 'mid'
  return 'lower'
}

function getMingShu(total: number, _level: string, gender: string, locale: string): MingShu {
  const levelTier = getMingShuLevel(total)

  // Locale override (EN / JA / KO)
  const loc = MINGSHU_MAP[locale]
  if (loc && loc[levelTier]) {
    return loc[levelTier]
  }

  // zh-CN base (fallback)
  return mingShuAnalysis(Math.floor(total), Math.round((total - Math.floor(total)) * 10), _level, gender)
}

function mingShuAnalysis(liang: number, qian: number, level: string, gender?: string): MingShu {
  const total = liang + qian / 10
  const isMale = gender === 'male'
  const levelTier = getMingShuLevel(total)

  const overviewMap: Record<string,string> = {
    upper: '此命骨重超群，根基深厚，乃人中龙凤之相。一生衣食丰足，名利双收，福禄寿俱全，晚年尤为昌隆。命格贵不可言，非寻常之辈可比。',
    midgood: '此命骨重中上，根基扎实，一生安稳有余。虽非大富大贵之命，但福泽深厚，衣禄不愁，中年后运势渐入佳境。宜勤勉守成，必有厚报。',
    mid: '此命骨重均衡，根基平稳。一生需自身努力，不可依赖他人。早年或有波折，中年后方见起色。知足常乐，平安是福。',
    lower: '此命骨重偏轻，根基较薄。一生多劳碌奔波，运势起伏较大。宜积德行善以增福报，不宜好高骛远，踏实做事为上策。',
  }

  let personality = ''
  if (total >= 5.0) {
    personality = isMale
      ? '个性刚毅果断，气度不凡，有领袖风范。为人正直豪爽，处事果断，有大将之风。自尊心强，不轻易服输，但也因此容易得罪小人。宜适当收敛锋芒，广结善缘。'
      : '气质高雅，端庄大方，有不凡的气度和格局。为人聪慧贤淑，处事得体，有旺夫益子之相。内心坚定有主见，不随波逐流，是典型的贵妇命格。'
  } else if (total >= 4.0) {
    personality = isMale
      ? '性格务实稳重，做事有条理。为人诚信可靠，待人真诚，有责任心。虽非锋芒毕露之辈，但胜在踏实肯干，循序渐进，终有所成。'
      : '性格温婉贤淑，持家有道。为人善良真诚，有包容心。做事细心周到，虽不争不抢，但自有一番天地。旺夫运佳，是贤内助之命。'
  } else if (total >= 3.5) {
    personality = isMale
      ? '性格平和踏实，为人勤恳。做事较为保守，不喜冒险。虽无大富大贵，但能安守本分，一生平顺。宜多开阔眼界，敢于尝试新事物。'
      : '性格温柔善良，待人亲和。做事认真负责，持家有方。虽不事张扬，但家庭和睦美满。宜多接触外界，开阔视野。'
  } else {
    personality = isMale
      ? '性格偏固执内向，不易与人推心置腹。做事喜欢独来独往，不善于借助外力。宜放宽心态，多结交益友，积累人脉以助运程。'
      : '性格内向柔弱，不善表达。内心敏感多思，容易忧虑。宜培养兴趣爱好，拓展社交圈子，建立自信。'
  }

  const marriageMap: Record<string,string> = {
    upper: isMale ? '婚姻美满，配偶贤惠，夫妻同心。异性缘好，易得贤妻相助。婚后家业兴旺，子女出息。宜晚婚更佳，早婚亦可。' : '婚姻顺遂，配偶有为之士。旺夫命格，婚后家运日隆。夫妻恩爱，子女成才。宜配德才兼备之君子。',
    midgood: isMale ? '婚姻平稳，配偶忠厚贤良。夫妻关系融洽，家庭和睦。晚婚更利于事业，婚后财运渐旺。宜以诚相待，珍惜姻缘。' : '婚姻和顺，配偶踏实可靠。家庭和睦，夫妻相敬如宾。宜配性情温和、有责任心的伴侣。',
    mid: isMale ? '婚姻较平淡，需双方共同努力经营。早年感情运势一般，中年后趋于稳定。宜多沟通理解，不可意气用事。' : '婚姻需耐心经营，不可急于求成。正缘稍晚，宜顺其自然。婚后家庭生活稳定，宜珍惜。',
    lower: isMale ? '婚姻运势偏弱，宜晚婚以避波折。择偶需谨慎，不宜仓促。婚后宜互相包容，方能长久。' : '姻缘较薄，宜晚婚。择偶需仔细考察，不可轻信于人。婚后宜多些耐心和包容。',
  }

  const careerMap: Record<string,string> = {
    upper: isMale ? '事业运极旺，宜从政或经商。有领导才能，适合管理岗位或自主创业。中年后事业腾飞，名利双收。' : '事业运旺，宜从事文化、教育、管理类工作。有贵人扶持，事业顺遂。亦可协助配偶事业发展。',
    midgood: isMale ? '事业运中上，宜选择稳定行业深耕。不适合频繁跳槽，专注一行必有成就。中年后事业渐入佳境。' : '事业平稳，宜从事文职、服务业等稳定工作。有才艺天赋，可发展副业。',
    mid: isMale ? '事业需勤勉经营，不宜好高骛远。宜选择务实的工作，积累经验和资源。中年后可尝试创业。' : '事业宜稳定为主，不宜频繁变动。可在自己擅长的领域深耕，积累口碑。',
    lower: isMale ? '事业运偏弱，宜安分守己做稳定工作。不适合创业，宜依附他人发展。勤勉工作，积累为重。' : '事业宜稳扎稳打，不适合冒险。宜选择有保障的行业，量力而行。',
  }

  const wealthMap: Record<string,string> = {
    upper: isMale ? '财运亨通，正财偏财皆旺。善于理财投资，有经商头脑。中年后财源滚滚，家业丰盈。宜合理规划资产配置。' : '财运旺盛，衣食无忧。有旺夫运，丈夫事业有成则家财万贯。自身也有理财天赋，宜合理投资。',
    midgood: isMale ? '财运稳中有升，宜稳健理财。不适合高风险投资，以正财收入为主。中年后财运渐旺，积累可观。' : '财运平稳，善于持家理财。家庭经济状况良好，子女成年后经济更加宽裕。',
    mid: isMale ? '财运平平，宜量入为出。不宜借钱给他人，也不宜盲目投资。以稳妥为主，积少成多。' : '财运一般，宜勤俭持家。不宜大手大脚，以储蓄为主。中年后略有改善。',
    lower: isMale ? '财运偏弱，宜精打细算。不宜投资理财，以正职稳定收入为主。避免借贷担保，谨防破财。' : '财运较弱，宜精简开支。不宜参与投资理财活动，以储蓄保本为上。',
  }

  const healthMap: Record<string,string> = {
    upper: '身体康健，精力充沛。宜注意饮食有度，不可过度操劳。定期体检，防患于未然。晚年注意心血管保养。',
    midgood: '身体基本健康，偶有微恙。宜规律作息，适当运动。注意肠胃和肝胆方面的保养。',
    mid: '体质偏弱，易感疲劳。宜加强锻炼，增强体质。注意季节变化，防范感冒等常见病。',
    lower: '体质较弱，需多加保养。宜早睡早起，饮食清淡有节。注意心脑血管和消化系统健康。',
  }

  const tipsMap: Record<string,Record<string,string>> = {
    upper: { male: '此命为贵格，天生福泽深厚。一生宜以德服人、施恩于人，则福报更增。宜从事公益慈善，积德以固福报。忌骄傲自满、目中无人，须知满招损谦受益。', female: '此命为福命，一生衣食无忧。宜相夫教子以积福，为人处世以柔克刚。忌锋芒太露、争强好胜，须知坤德以柔为贵。' },
    midgood: { male: '此为中上之命，宜勤奋进取，中年后自有回报。宜广结善缘，积累人脉。忌畏首畏尾、错失良机。', female: '此为中上之命，宜善用自身优势相夫教子。宜多学习充实自己，与丈夫共同进步。忌消极依赖、不思进取。' },
    mid: { male: '此为中和之命，一生平稳。宜脚踏实地，厚积薄发。忌冒进求快，须知欲速不达。多做好事可改善运势。', female: '此为中和之命，一生平淡是真。宜持家有道，与人为善。忌攀比虚荣，知足常乐。' },
    lower: { male: '此命骨轻，宜知天命、顺其自然。多做善事可增福报，切忌怨天尤人。改变命运的根本在于积德行善、自强不息。', female: '此命骨轻，宜修身养性。多做善事、广结善缘可改善运势。忌心浮气躁、贪图捷径。' },
  }

  return {
    overview: overviewMap[levelTier] || overviewMap.mid,
    personality,
    marriage: marriageMap[levelTier] || marriageMap.mid,
    career: careerMap[levelTier] || careerMap.mid,
    wealth: wealthMap[levelTier] || wealthMap.mid,
    health: healthMap[levelTier] || healthMap.mid,
    tips: (tipsMap[levelTier]?.[isMale ? 'male' : 'female']) || tipsMap.mid[isMale ? 'male' : 'female'],
  }
}

export default function ChengguClient() {
  const getT = useT()
  const { locale } = useLocale()
  const [calendarType, setCalendarType] = useState<CalendarType>('solar')
  const [gender, setGender] = useState<'male'|'female'>('male')
  const [year, setYear] = useState('1990')
  const [month, setMonth] = useState('1')
  const [day, setDay] = useState('1')
  const [hour, setHour] = useState('5')
  const [isLeapMonth, setIsLeapMonth] = useState(false)
  const [result, setResult] = useState<{
    yearW: number; monthW: number; dayW: number; hourW: number;
    total: number; liang: number; qian: number;
    gzYear: string; lMonth: number; lDay: number; dz: string;
    solarLabel: string; lunarLabel: string; gender: string;
    mingShu: MingShu; poem: string; interpret: string; level: string;
  } | null>(null)

  const calc = () => {
    try {
      const y = parseInt(year), m = parseInt(month), d = parseInt(day)
      const hIdx = parseInt(hour)
      let lunar: Lunar, solarLabel: string, lunarLabel: string
      if (calendarType === 'solar') {
        const solar = Solar.fromYmd(y, m, d)
        lunar = solar.getLunar()
        solarLabel = solar.toFullString()
        lunarLabel = lunar.toFullString()
      } else {
        lunar = Lunar.fromYmd(y, isLeapMonth ? -m : m, d)
        lunarLabel = lunar.toFullString()
        try { solarLabel = lunar.getSolar().toFullString() } catch { solarLabel = '—' }
      }
      const gzYear = lunar.getYearInGanZhi()
      const lMonth = lunar.getMonth()
      const lDay = lunar.getDay()
      const yearW = YEAR_W[gzYear] || 0
      const monthW = MONTH_W[lMonth] || 0
      const dayW = DAY_W[lDay] || 0
      const dz = HOUR_DZ[hIdx]
      const hourW = HOUR_W[hIdx] || 0
      const total = yearW + monthW + dayW + hourW
      const totalStr = total.toFixed(1)
      const liang = Math.floor(total)
      const qian = Math.round((total - liang) * 10)
      const fortune = getFortune(gender, totalStr, locale)
      const mingShu = getMingShu(total, fortune.level, gender, locale)
      setResult({ yearW, monthW, dayW, hourW, total, liang, qian, gzYear, lMonth, lDay, dz, solarLabel, lunarLabel, gender, mingShu, ...fortune })
    } catch { setResult(null) }
  }

  const r = result

  return (<div className="max-w-2xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold text-gold-400 font-serif mb-3">{getT('chengguPage.title')}</h1>
    <p className="text-gray-400 mb-6">{getT('chengguPage.desc')}</p>

    <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-6 mb-8">
      {/* 历法 & 性别 */}
      <div className="space-y-4">
        <CalendarInput
          calendarType={calendarType}
          year={year}
          month={month}
          day={day}
          hour={hour}
          isLeapMonth={isLeapMonth}
          onCalendarTypeChange={(t) => { setCalendarType(t); setResult(null) }}
          onYearChange={setYear}
          onMonthChange={(v) => { setMonth(v); setIsLeapMonth(false) }}
          onDayChange={setDay}
          onHourChange={setHour}
          onLeapMonthChange={setIsLeapMonth}
          label="出生日期"
        />

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{getT('chengguPage.genderLabel')}</span>
          <div className="flex bg-dark-700 rounded-lg p-1 gap-1">
            <button onClick={()=>{setGender('male');setResult(null)}}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${gender==='male'?'bg-gold-600 text-dark-900':'text-gray-400'}`}>♂ {getT('chengguPage.maleLabel')}</button>
            <button onClick={()=>{setGender('female');setResult(null)}}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${gender==='female'?'bg-gold-600 text-dark-900':'text-gray-400'}`}>♀ {getT('chengguPage.femaleLabel')}</button>
          </div>
          <span className="text-[10px] text-gray-500 ml-1">{getT('chengguPage.genderNote')}</span>
        </div>
      </div>

      <button onClick={calc} className="bg-gold-600 hover:bg-gold-500 text-dark-900 font-semibold px-6 py-2.5 rounded-lg transition-colors active:scale-95 mt-4">{getT('chengguPage.submit')}</button>
    </div>

    {r && (<div className="space-y-4">
      <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-5 text-center">
        <p className="text-xs text-gray-500 mb-1">
          {r.gender === 'male' ? `♂ ${getT('chengguPage.maleLabel')}` : `♀ ${getT('chengguPage.femaleLabel')}`} · {getT('chengguPage.yearCol')}：{r.gzYear}
        </p>
        <p className="text-[10px] text-gray-400">阳历：{r.solarLabel}</p>
        <p className="text-[10px] text-gray-400 mb-2">阴历：{r.lunarLabel}</p>
        <p className="text-4xl font-bold text-gold-400">{r.liang}两{r.qian}钱</p>
        <p className={`text-sm mt-1 ${['上吉','Excellent','大吉','Great Auspicious','上吉','대길'].includes(r.level)?('text-jade-500'):['中吉','Good','中吉','Moderate Auspicious','중길'].includes(r.level)?('text-jade-500'):['中平','Average','中平','Neutral','중평'].includes(r.level)?('text-gold-500'):('text-zhuhong')}`}>骨重：{r.liang}两{r.qian}钱 · {r.level}</p>
      </div>

      <div className="grid grid-cols-4 gap-2 text-xs">
        {[
          {label:getT('chengguPage.yearCol'),v:r.gzYear,w:`${r.yearW}两`},
          {label:getT('chengguPage.monthCol'),w:`${r.monthW}两`,v:`${r.lMonth}月`},
          {label:getT('chengguPage.dayCol'),w:`${r.dayW}两`,v:`${r.lDay}日`},
          {label:getT('chengguPage.hourCol'),w:`${r.hourW}两`,v:r.dz+'时'},
        ].map((x,i)=>(
          <div key={i} className="bg-dark-700 rounded-lg p-2 text-center border border-dark-600">
            <p className="text-gray-500">{x.label}</p><p className="text-gray-200">{x.v}</p><p className="text-gold-400">{x.w}</p>
          </div>
        ))}
      </div>

      <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-5">
        <h3 className="text-sm font-semibold text-gold-400 mb-2">{r.gender === 'male' ? `♂ ${getT('chengguPage.poemMale')}` : `♀ ${getT('chengguPage.poemFemale')}`}</h3>
        <p className="text-sm text-gray-200 leading-loose whitespace-pre-line">{r.poem}</p>
      </div>
      <div className="bg-dark-800/80 rounded-xl border border-dark-600 p-5">
        <h3 className="text-sm font-semibold text-gold-400 mb-2">{r.gender === 'male' ? `♂ ${getT('chengguPage.readingMale')}` : `♀ ${getT('chengguPage.readingFemale')}`}</h3>
        <p className="text-sm text-gray-300 leading-relaxed">{r.interpret}</p>
      </div>

      {/* 命书分析 */}
      <div className="bg-dark-800/80 rounded-xl border border-gold-500/30 p-5">
        <h3 className="text-sm font-semibold text-gold-400 mb-3">{getT('chengguPage.mingShuTitle')}</h3>
        <p className="text-xs text-gold-500 mb-3 leading-relaxed">{r.mingShu.overview}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-dark-700/60 rounded-lg p-3">
            <h4 className="text-jade-500 font-semibold mb-1">{getT('chengguPage.personality')}</h4>
            <p className="text-gray-300 leading-relaxed">{r.mingShu.personality}</p>
          </div>
          <div className="bg-dark-700/60 rounded-lg p-3">
            <h4 className="text-jade-500 font-semibold mb-1">{getT('chengguPage.marriage')}</h4>
            <p className="text-gray-300 leading-relaxed">{r.mingShu.marriage}</p>
          </div>
          <div className="bg-dark-700/60 rounded-lg p-3">
            <h4 className="text-jade-500 font-semibold mb-1">{getT('chengguPage.career')}</h4>
            <p className="text-gray-300 leading-relaxed">{r.mingShu.career}</p>
          </div>
          <div className="bg-dark-700/60 rounded-lg p-3">
            <h4 className="text-jade-500 font-semibold mb-1">{getT('chengguPage.wealth')}</h4>
            <p className="text-gray-300 leading-relaxed">{r.mingShu.wealth}</p>
          </div>
        </div>
        <div className="mt-3 bg-dark-700/60 rounded-lg p-3">
          <h4 className="text-jade-500 font-semibold mb-1 text-xs">{getT('chengguPage.health')}</h4>
          <p className="text-gray-300 leading-relaxed text-xs">{r.mingShu.health}</p>
        </div>
        <div className="mt-3 bg-gold-900/20 rounded-lg p-3 border border-gold-700/30">
          <h4 className="text-gold-400 font-semibold mb-1 text-xs">{getT('chengguPage.lifeTips')}</h4>
          <p className="text-gray-200 leading-relaxed text-xs">{r.mingShu.tips}</p>
        </div>
              <div className="flex justify-end mt-3">
                <ShareResult
                  text={`${r.liang}两${r.qian}钱 - ${r.level}\n\n${getT('chengguPage.poemMale')}: ${r.poem}\n${getT('chengguPage.readingMale')}: ${r.interpret}\n\n${getT('chengguPage.personality')}: ${r.mingShu.personality}\n${getT('chengguPage.marriage')}: ${r.mingShu.marriage}\n${getT('chengguPage.career')}: ${r.mingShu.career}\n${getT('chengguPage.wealth')}: ${r.mingShu.wealth}\n${getT('chengguPage.health')}: ${r.mingShu.health}`}
                  title="【称骨测算结果】"
                  label={getT('chengguPage.copyResult')}
                />
              </div>
      </div>
    </div>)}
  </div>)
}
