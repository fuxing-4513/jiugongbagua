import type { BookChapter } from '../categories'

const make = (id: string, title: string, desc: string): BookChapter => ({
  bookId: id, chapters: [{ id:'intro', title: title + '·导读', content: desc }]
})

export const shenfengContent = make('shenfeng-tongkao','神峰通考','明代张楠著，以考辨历代命理学说正本清源。力主命理之源在于阴阳五行，反对神煞泛滥。')
export const mingliyueyanContent = make('mingli-yueyan','命理约言','清代陈素庵著，简明扼要梳理八字精要，从干支十神到格局大运，言简意赅。')
export const xingpingContent = make('xingping-huihai','星平会海','明代汇辑禄命诸家之说，兼论五星七政四余与子平法两大体系。')
export const ziweiquanjiContent = make('ziwei-quanji','紫微斗数全集','明清汇编的斗数文献总集，收录大量宋明斗数诀法赋文星曜注解和命例。')
export const tiebanContent = make('tieban-shenshu','铁板神数','邵雍传，以数起卦以卦断命。数语固定，口诀秘传，传统术数中最神秘的门类之一。')
export const yimaoContent = make('yi-mao','易冒','清代程良玉著，六爻理论最精深著作之一。对五行生克日月建动变冲合旬空月破等剖析精深。')
export const yilinbuyiContent = make('yi-lin-buyi','易林补遗','明代张星元著，博采焦氏易林火珠林以来诸家之说。')
export const taibaiContent = make('taibai-yinjing','太白阴经','唐代李筌著，兵家与术数合璧之作。大量引用奇门太乙知识作为军事决策依据。')
export const dunjiaContent = make('dunjia-yanyi','遁甲演义','明代程道生著，演义体阐释奇门。含烟波钓叟歌详解、八门九星演义等。')
export const liurenContent = make('liuren-shenke','六壬神课','六壬占验实例集，收录大量金口诀应用实例和判断心得。')
export const daliurenContent = make('daliuren-zhinan','大六壬指南','清代六壬学者编撰的入门至进阶读物，对课式构成占断理路做了系统梳理。')
export const yuzhengContent = make('huangdi-neijing-yunqi','黄帝内经运气七篇','五运六气理论之祖。含天元纪大论五运行大论六微旨大论气交变大论五常政大论六元正纪大论至真要大论。以天干地支五行生克六气司天在泉构气运推演体系。')
export const sanyincContent = make('sanyin-sitian','三因司天方','南宋陈无择著，五运六气理论在方剂学中的应用。每年岁运司天在泉制定方剂。')
export const yunqiContent = make('yunqi-yilan','运气易览','明代汪机著，通俗阐释五运六气基本原理。含干支化运主气客气司天在泉运气相合。')
export const yumaijContent = make('yuhan-jing','玉函经','唐杜光庭著，脉学命理结合。以三关脉象为基础结合五行八卦推断命运。')
