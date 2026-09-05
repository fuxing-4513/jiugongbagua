import type { BookChapter } from '../categories'
import { daodejingContent } from './daode-jing'; import { yinfujingContent } from './yinfu-jing'
import { ganyingpianContent } from './ganying-pian'; import { chengguContent } from './chenggu'
import { ziweiquanshuContent } from './ziwei-quanshu'
import { zhouyiContent } from './zhouyi'; import { hetuluoshuContent } from './hetu-luoshu'
import { lingqijingContent } from './lingqi-jing'; import { wuzhenpianContent } from './wuzhen-pian'
import { huangjinceContent } from './huangjin-ce'; import { lieziContent } from './lie-zi'
import { baopuziContent } from './baopu-zi'; import { xiaoliurenContent } from './xiaoliuren'
import { xuexinfuContent } from './xuexin-fu'; import { wuxingdayiContent } from './wuxing-dayi'
import { guiguziContent } from './guiguzi'; import { zhonglvchuandaoContent } from './zhonglv-chuandao'
import { lingchengjingyiContent } from './lingcheng-jingyi'; import { guijingContent } from './gui-jing'
import { yisizhanContent } from './yisizhan'; import { maijingContent } from './mai-jing'
import { taiyishenshuContent } from './taiyi-shenshu'; import { jiaoshiyilinContent } from './jiaoshi-yilin'
import { guanyinContent, lvzuContent } from './lingqian-all'; import { huozhulinContent } from './huozhu-lin'
import { meihuayishuContent } from './meihua-yishu'; import { liurendaquanContent } from './liuren-daquan'
import { shenxiangquanbianContent } from './shenxiang-quanbian'
import { sanmingtonghuiContent } from './sanming-tonghui'
import { yuanhaizipingContent } from './yuanhai-zipping'; import { ditiansuiContent } from './ditian-sui'
import { zippinzhenquanContent } from './zipping-zhenquan'
import { qiongtongbaojianContent } from './qiongtong-baojian'
import { bushizhengzongContent } from './bushi-zhengzong'
import { zangshuContent } from './zang-shu'
import { zhuangziContent } from './zhuangzi'
import { mayishenxiangContent } from './mayi-shenxiang'
import { zengshanbuyiContent } from './zengshan-buyi'
import { hanlongjingContent } from './hanlong-jing'
import { yueboContent } from './yuebo-dongzhong'
import { tetrabiblosContent } from './batch4'
import { zhouyizhengyiContent, wuxingjingjiContent, diliwujueContent } from './batch5'
import { zhouyibenyiContent } from './batch6'
import { qimenMijiContent as qimendunjiCont } from './qimen-dunjia-miji'
import { liurenJinkoujueContent as liurenjinkoujueCont } from './liuren-jinkoujue'
import { yangzhaiSanyaoContent as yangzhaisanyaoCont } from './yangzhai-sanyao'
import { huangtingjingContent as batch6Huangting } from './huangting-jing'
import { xingxueDeepContent as xingxuedachengCont } from './xingxue-dacheng'
import { taqingContent, renlunContent, yilongContent, qingnangContent, qingnangayuContent, tianyuContent, bazhaiContent } from './batch7'
import { liuzhuangContent, xiangliContent, yuzhangContent, zhougongContent, huangliContent, shengxiaoContent, xingmingwugeContent, guandiContent, mazuContent, huangdaxianContent, zhugeContent } from './batch8'
import { shenfengContent, ziweiquanjiContent, yimaoContent as batch9Yimao, yilinbuyiContent as batch9Yilin, taibaiContent, dunjiaContent, liurenContent, daliurenContent, yuzhengContent, sanyincContent, yunqiContent, yumaijContent } from './batch9'
import { kaiyuanContent, yanqinContent, xingminggzContent, goldenContent, keyContent, ganshiContent, xiejiContent, yuxiaContent, shennongContent, yunqiJwContent, shenxianContent, yunjiContent, canfzContent, zangzhaiContent } from './batch10'
import { b1,b2,b3,b4,b5,b6,b7,b8,b9,b10,b11,b12,b13,b14,b15,b16,b17,b18,b19,b20,b21,b22,b23,b24,b25,b26,b27,b28,b29,b30,b31,b32,b33,b34 } from './batch11'
import { zoharDeepContent, astrologyDeepContent, picatrixDeepContent } from './western-deep'
import { deep1, deep2, deep3, deep4, deep5, deep6, deep7, deep8, deep9, deep10, deep11, deep12, deep13, deep14, deep15, deep16 } from './deeper-batch'
import { b1 as z1,b2 as z2,b4 as z4,b5 as z5,b6 as z6,b7 as z7,b8 as z8,b9 as z9,b10 as z10,b11 as z11,b12 as z12,b13 as z13,b14 as z14,b15 as z15,b16 as z16,b17 as z17,b18 as z18,b19 as z19,b20 as z20 } from './last-deep'
import { xingpingContent, huangjijingContent, tiebanContent, guolaoContent } from './mingli-deep'
import { xingxueDeepContent as xingxueCont } from './xingxue-dacheng'
import { lixuzhongContent } from './mingli-more'
import { shenfengDeepContent as shenfengFullCont } from './shenfeng-tongkao'
import { zhouyizhengyiContent as zhengyiContent } from './zhouyi-zhengyi'
import { zhouyibenyiContent as benyiContent } from './zhouyi-benyi'
import { ziweiquanjiContent as quanjiContent } from './ziwei-quanji'
import { huangjijingContent as jingshiContent } from './huangji-jingshi'
import { ruyanquanshuContent as ruyanFullCont } from './ruyan-quanshu'
import { zangzhaishuContent as zangzhaiFullCont } from './zang-zhai-shu'
import { wenziContent as wenziFullCont } from './wen-zi'
import { yunjiqiqianContent as yunjiFullCont } from './yunji-qiqian'
import { canfenzhuContent as canfzFullCont } from './zhouyi-cantongqi-fenzhu'
import { yuzhendingzhenContent as yuzhenFullCont } from './yuzhen-dingzhen-dan'
import { shiliuguijingContent as shiliugFullCont } from './shiliu-guijing'
import { mengxibitanContent as mengxiFullCont } from './mengxi-bitan'
import { qizhengtuibuContent as qizhengFullCont } from './qizheng-tuibu'
import { xingxueDeepContent } from './xingxue-dacheng'
import { mingliyueyanContent } from './mingli-yueyan'
import { wuxingjingjiFull, ziweiquanjiFull } from './mingli-last'
import { luoluziContent } from './luoluzi-sanming'
import { yuzhaoContent } from './yuzhao-dingzhen'

import { zhouyizhengyiDeep, shangyiDeep } from './bushi-deep'
import { yimaoContent as yimaoCont } from './yi-mao'
import { qimenMijiContent as qimenMijiCont } from './qimen-dunjia-miji'
import { haidiYanContent as haidiyanCont } from './haidi-yan'
import { tianxuanFuContent as tianxuanfuCont } from './tianxuan-fu'
import { bushiQuanshuContent as bushiQuanshuCont } from './bushi-quanshu'
import { bushiQuanshuContent } from './bushi-quanshu'
import { yimaoContent } from './yi-mao'
import { yilinbuyiContent } from './yi-lin-buyi'
import { qimenMijiContent } from './qimen-dunjia-miji'
import { mayiShenxiangDeep, liuzhuangDeep, shuijingDeep, xiangliDeep, yuzhangDeep, renlunDeep, yuquanDeep, taiqingDeep, xiangguDeep } from './xiangshu-deep'
import { tianyuDeep, luojingDeep, ruyanDeep, zhaizhaiDeep } from './fengshui-deep'
import { yilongjingContent as yilongCont } from './yilong-jing'
import { qingnangjingContent as qingnangCont } from './qingnang-jing'
import { qingnangAoyuContent as qingnangayuCont } from './qingnang-aoyu'
import { bazhaiMingjingContent as bazhaiCont } from './bazhai-mingjing'
import { diliWujueContent as wujueCont } from './dili-wujue'
import { xuexinfuContent as xuexinCont } from './xuexin-fu'
import { famweiContent as famweiCont } from './famwei-lun'
import { yangzhaiSanyaoContent as sanyaoCont } from './yangzhai-sanyao'
import { yangzhaiShishuContent as shishuCont } from './yangzhai-shishu'
import { zhouyiCantongqiContent } from './zhouyi-cantongqi'
import { zuowanglunContent } from './zuowang-lun'; import { yanbodiaosougeContent } from './yanbo-diaosou-ge'
import { taixuanjingContent } from './tai-xuan-jing'
import { dilibianzhengContent } from './dili-bianzheng'
import { huangtingjingContent } from './huangting-jing'
import { shenxianZhuanContent } from './shenxian-zhuan'
import { xingmingGuizhiContent } from './xingming-guizhi'
import { yilongjingContent } from './yilong-jing'
import { qingnangjingContent } from './qingnang-jing'
import { famweiContent } from './famwei-lun'
import { qingnangAoyuContent } from './qingnang-aoyu'
import { cantongqiDeep, huangtingDeep, wenziDeep, shenxianDeep, yunjiDeep, canfzDeep, zhuangziwaiDeep, shiliugDeep, yuzhenDeep, sanyinDeep, yunqiDeep, yuhanDeep, shennongDeep, zhangzhongDeep, jinkuiDeep, zhougongDeep, menglinDeep } from './remaining-deep'
import { huangdineijingyunqiContent } from './huangdi-neijing-yunqi'
import { jingshiyizhuanContent } from './jingshi-yizhuan'
import { guanxiangContent } from './guanxiang-wanzhan'
import { liurenShenkeContent } from './liuren-shenke'
import { liurenJinkoujueContent } from './liuren-jinkoujue'
import { dunjiaYanyiContent } from './dunjia-yanyi'
import { shiliuZhangjingContent } from './shiliu-zhangjing'
import { taibaiYinjingContent } from './taibai-yinjing'
import { daliurenZhinanContent } from './daliuren-zhinan'
import { haidiYanContent } from './haidi-yan'
import { tianxuanFuContent } from './tianxuan-fu'
import { zhugeShenshuContent } from './zhuge-shenshu'
import { kaiyuanZhanjingContent } from './kaiyuan-zhanjing'
import { ganshiXingjingContent } from './gan-shi-xingjing'
import { bazhaiMingjingContent } from './bazhai-mingjing'
import { diliWujueContent } from './dili-wujue'
import { yangzhaiSanyaoContent } from './yangzhai-sanyao'
import { yangzhaiShishuContent } from './yangzhai-shishu'

export const bookContentMap: Record<string, BookChapter> = {
  'daode-jing':daodejingContent, 'huangdi-yinfujing':yinfujingContent, 'taishang-ganying':ganyingpianContent,
  'chenggu-ge':chengguContent, 'zhouyi':zhouyiContent, 'hetu-luoshu':hetuluoshuContent,
  'lingqi-jing':lingqijingContent, 'wuzhen-pian':wuzhenpianContent, 'huangjin-ce':huangjinceContent,
  'lie-zi':lieziContent, 'baopu-zi':baopuziContent, 'xiaoliuren-zhangjue':xiaoliurenContent,
  'xuexin-fu':xuexinfuContent, 'wuxing-dayi':wuxingdayiContent, 'guiguzi':guiguziContent,
  'zhonglv-chuandao':zhonglvchuandaoContent, 'lingcheng-jingyi':lingchengjingyiContent, 'gui-jing':guijingContent,
  'yisi-zhan':yisizhanContent, 'mai-jing':maijingContent, 'taiyi-shenshu':taiyishenshuContent,
  'jiaoshi-yilin':jiaoshiyilinContent, 'guanyin-lingqian':guanyinContent, 'lvzu-lingqian':lvzuContent,
  'huozhu-lin':huozhulinContent, 'meihua-yishu':meihuayishuContent, 'liuren-daquan':liurendaquanContent,
  'shuilin-shenxiang':shenxiangquanbianContent, 'sanming-tonghui':sanmingtonghuiContent,
  'zhouyi-zhengyi':zhengyiContent, 'zhouyi-benyi':benyiContent,
  'ziwei-quanji':quanjiContent, 'huangji-jingshi':jingshiContent,
  'ruyan-quanshu':ruyanFullCont, 'zang-zhai-shu':zangzhaiFullCont,
  'wen-zi':wenziFullCont, 'yunji-qiqian':yunjiFullCont,
  'zhouyi-cantongqi-fenzhu':canfzFullCont, 'yuzhen-dingzhen-dan':yuzhenFullCont,
  'shiliu-guijing':shiliugFullCont, 'mengxi-bitan':mengxiFullCont, 'qizheng-tuibu':qizhengFullCont,
  'yuanhai-zipping':yuanhaizipingContent, 'ditian-sui':ditiansuiContent,
  'zipping-zhenquan':zippinzhenquanContent, 'qiongtong-baojian':qiongtongbaojianContent,
  'ziwei-quanshu':ziweiquanshuContent, 'bushi-zhengzong':bushizhengzongContent, 'zang-shu':zangshuContent,
  'zhuangzi':zhuangziContent, 'mayi-shenxiang':mayishenxiangContent, 'zengshan-buyi':zengshanbuyiContent,
  'hanlong-jing':hanlongjingContent, 'tetrabiblos':z15,
  'wuxing-jingji':wuxingjingjiFull, 'jingshi-yizhuan':jingshiyizhuanContent, 'dili-wujue':diliWujueContent,
  'qimen-dunjia-miji':qimendunjiCont, 'liuren-jinkoujue':liurenjinkoujueCont,
  'yangzhai-sanyao':yangzhaisanyaoCont, 'huangting-jing':huangtingjingContent,
  'xingxue-dacheng':xingxueCont, 'yuebo-dongzhong':yueboContent, 'taiqing-shenjian':taiqingDeep,
  'renlun-datong':renlunDeep, 'yilong-jing':yilongjingContent, 'qingnang-jing':qingnangjingContent,
  'qingnang-aoyu':qingnangAoyuContent, 'tianyu-jing':tianyuDeep, 'bazhai-mingjing':bazhaiMingjingContent,
  'liuzhuang-xiangfa':liuzhuangDeep, 'xiangli-hengzhen':xiangliDeep, 'yuzhang-ji':yuzhangDeep,
  'zhougong-jiemeng':zhougongDeep, 'huangli-tongshu':z5, 'shengxiao-wenhua':z6,
  'xingming-wuge':z4, 'guandi-lingqian':guandiContent, 'mazu-lingqian':mazuContent,
  'huangdaxian-lingqian':huangdaxianContent, 'zhuge-shenshu':zhugeShenshuContent,
  'shenfeng-tongkao':shenfengFullCont, 'mingli-yueyan':mingliyueyanContent, 'xingping-huihai':xingpingContent,
 'tieban-shenshu':tiebanContent, 'yi-mao':yimaoContent,
  'yi-lin-buyi':yilinbuyiContent, 'taibai-yinjing':taibaiYinjingContent, 'dunjia-yanyi':dunjiaYanyiContent,
  'liuren-shenke':liurenShenkeContent, 'daliuren-zhinan':daliurenZhinanContent,
  'huangdi-neijing-yunqi':huangdineijingyunqiContent, 'sanyin-sitian':sanyinDeep, 'yunqi-yilan':yunqiDeep, 'yuhan-jing':yuhanDeep,
  'kaiyuan-zhanjing':kaiyuanZhanjingContent, 'guanxiang-wanzhan':guanxiangContent, 'yanqin-tongzuan':z7,
  'xingming-guizhi':xingmingGuizhiContent, 'golden-dawn':z19, 'key-of-solomon':z20,
  'gan-shi-xingjing':ganshiXingjingContent, 'xieji-bianfang':z8, 'yuxia-ji':z9,
  'shennong-benxao':shennongDeep, 'yunqi-jingwei':yunqiJwContent, 'shenxian-zhuan':shenxianZhuanContent,
 'shuijing-shenxiang':shuijingDeep, 'luojing-toujie':luojingDeep, 'zhouyi-cantongqi':zhouyiCantongqiContent, 'menglin-xuanjie':menglinDeep,
  'li-xuzhong':lixuzhongContent, 'yuzhao-dingzhen':yuzhaoContent, 'luoluzi-sanming':luoluziContent, 'guolao-xingzong':guolaoContent, 'haidi-yan':haidiYanContent,
  'tianxuan-fu':tianxuanFuContent, 'bushi-quanshu':bushiQuanshuContent, 'famwei-lun':famweiContent, 'yangzhai-shishu':yangzhaiShishuContent,
  'yuquan-zhaoshen':yuquanDeep, 'corpus-hermeticum':z17, 'three-books-occult':z18,
  'shiliu-zhangjing':shiliuZhangjingContent, 'wanbao-quanshu':z12, 'picatrix':picatrixDeepContent,
  'zohar':zoharDeepContent, 'astrology-medieval':astrologyDeepContent, 'santai-bishi':z13, 'xianggu-jing':xiangguDeep, 'shanhai-jing':z14,
  'zhangzhong-jing':zhangzhongDeep, 'jinkui-yuelue':jinkuiDeep, 'rider-waite-tarot':z16,
  'zhuangzi-wai':zhuangziwaiDeep,
  'zuowang-lun':zuowanglunContent, 'yanbo-diaosou-ge':yanbodiaosougeContent, 'tai-xuan-jing':taixuanjingContent, 'dili-bianzheng':dilibianzhengContent,

}
export function getBookContent(bookId: string): BookChapter | undefined { return bookContentMap[bookId] }
export function hasContent(bookId: string): boolean { return bookId in bookContentMap }
