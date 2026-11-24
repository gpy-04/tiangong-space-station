// Dates and achievements are grounded in the official references attached to every entry.
const S={
 foundation:['国家航天局 · 老五院：中国航天六十甲子的起点','https://www.cnsa.gov.cn/n6758968/n6758974/c6772286/content.html'],
 early:['国家航天局 · 中国航天事业记事','https://www.cnsa.gov.cn/n6758968/n6758973/c6795593/content.html'],
 manned:['中国载人航天 · 飞行任务大事记','https://www.cmse.gov.cn/xwzx/202209/t20220921_50802.html'],
 shenzhou:['中国载人航天 · 飞行任务大事记','https://www.cmse.gov.cn/xwzx/202209/t20220921_50802.html'],
 walk:['国家航天局 · 首次空间出舱活动','https://www.cnsa.gov.cn/n6758968/n6758972/c6797096/content.html'],
 lunar:['国家航天局 · 航天点亮梦想','https://www.cnsa.gov.cn/n6758823/n6758844/n6760386/n6760392/c6827649/content.html'],
 beidou:['国家航天局 · 北斗三号全球系统正式开通','https://www.cnsa.gov.cn/n6758822/c6809961/content.html'],
 station:['中国载人航天 · T 字基本构型组装完成','https://www.cmse.gov.cn/xwzx/202211/t20221103_51224.html'],
 tianhe:['中国载人航天 · 天和核心舱','https://www.cmse.gov.cn/fxrw/kjzthhxcrw/zhxw/202105/t20210507_47816.html'],
 six:['国家航天局 · 嫦娥六号携月背珍宝回家','https://www.cnsa.gov.cn/n6758823/n6758844/n10518102/n10518157/c10570560/content.html']
};
export const HISTORY=[
 {id:'foundation',date:'1956.10.08',era:'起步与突破',name:'中国航天事业创建',short:'事业起点',model:'satellite',badge:'从零起步',summary:'国防部第五研究院成立，中国航天事业由此起步。',achievement:'形成自己的航天科研组织与人才队伍，逐步建立火箭研制、试验和发射能力。后来的卫星、载人航天与深空探测，建立在这一长期积累之上。',principle:'航天成就来自一个系统：运载火箭、航天器、发射场、测控网和人才队伍需要一起发展。',facts:[['事业起点','1956 年'],['展陈线索','火箭与卫星']],source:S.foundation,caption:'以东方红一号缩比展品，串起中国航天的起步阶段。'},
 {id:'dongfanghong',date:'1970.04.24',era:'起步与突破',name:'东方红一号成功发射',short:'首颗人造卫星',model:'satellite',badge:'中国第一颗',summary:'长征一号将东方红一号送入轨道，中国成功发射第一颗人造地球卫星。',achievement:'中国成为世界上第五个独立研制并发射人造地球卫星的国家。来自太空的《东方红》乐曲，标志着中国进入空间时代。',principle:'火箭提供入轨所需速度。卫星进入轨道后，在地球引力作用下持续运动；无线电把信号传回地面测站。',facts:[['发射日期','1970.04.24'],['运载火箭','长征一号'],['历史成就','独立发射卫星']],source:S.early,caption:'东方红一号 · 多面体星体与天线的展陈缩比示意。'},
 {id:'recover',date:'1975.11.26',era:'起步与突破',name:'首颗返回式卫星发射',short:'卫星返回技术',model:'satellite',badge:'从入轨到返回',summary:'中国首颗返回式卫星发射，三天后成功返回地面。',achievement:'中国成为世界上第三个掌握卫星返回技术的国家。航天器可以将任务成果带回地球，进入大气、减速与回收技术也成为后续发展的重要积累。',principle:'返回需要先改变轨道，再穿过大气层。热防护承受气动加热，减速与回收系统帮助返回舱安全着陆。',facts:[['发射日期','1975.11.26'],['返回时间','发射三天后'],['能力突破','航天器回收']],source:S.early,caption:'本节点使用早期卫星代表展品，不作为返回式卫星外形复原。'},
 {id:'project',date:'1992.09.21',era:'走向载人',name:'载人航天工程立项',short:'载人航天起航',model:'shenzhou',badge:'三步走战略',summary:'中国载人航天工程正式立项，按“三步走”战略推进。',achievement:'从发射载人飞船，到突破出舱活动和交会对接，再到建造空间站，中国载人航天确立了连续发展的路线。',principle:'载人飞行既要解决运输，也要解决生命保障、返回、测控和应急救生。把任务分成连续步骤，可以逐项验证关键能力。',facts:[['立项日期','1992.09.21'],['发展路线','载人飞船 → 空间实验室 → 空间站']],source:S.manned,caption:'神舟飞船代表展品 · 轨道舱、返回舱与推进舱。'},
 {id:'shenzhou1',date:'1999.11.20',era:'走向载人',name:'神舟一号试验飞船发射',short:'首艘试验飞船',model:'shenzhou',badge:'验证系统',summary:'神舟一号无人试验飞船发射，中国载人航天工程首次飞行试验展开。',achievement:'通过真实飞行检验飞船、火箭、发射场和测控回收系统，为后续载人飞行逐步积累证据。',principle:'无人试验先验证关键系统是否按预期工作。载人航天把验证前移，逐步减少正式载人任务中的未知因素。',facts:[['发射日期','1999.11.20'],['任务类型','无人试验'],['历史位置','工程首次飞行试验']],source:S.manned,caption:'神舟系列总体构型示意，细部不对应神舟一号实物。'},
 {id:'shenzhou5',date:'2003.10.15',era:'走向载人',name:'中国首次载人航天飞行',short:'杨利伟飞向太空',model:'shenzhou',badge:'独立载人飞行',summary:'杨利伟乘神舟五号飞船进入太空，中国首次载人航天飞行取得成功。',achievement:'中国成为世界上第三个独立掌握载人航天技术的国家。从把物体送入太空，迈向把人送入太空并安全返回。',principle:'神舟飞船由轨道舱、返回舱和推进舱组成。返回时只有返回舱进入大气，热防护和降落伞帮助航天员回到地面。',facts:[['航天员','杨利伟'],['发射日期','2003.10.15'],['历史成就','首次载人航天飞行']],source:S.shenzhou,caption:'神舟系列代表性构型 · 可拖动观察三舱关系。'},
 {id:'change1',date:'2007.10.24',era:'月球与深空',name:'嫦娥一号奔向月球',short:'首次月球探测',model:'lander',badge:'探月工程第一步',summary:'嫦娥一号发射，开启中国首次月球探测任务。',achievement:'中国航天的探测目标从近地空间拓展到月球。探月工程逐步建立绕月、着陆、巡视与采样返回能力。',principle:'绕月探测需要从地球出发，完成地月转移，在月球附近减速并进入绕月轨道，再进行科学观测。',facts:[['发射日期','2007.10.24'],['探测目标','月球'],['任务特点','绕月探测']],source:S.lunar,caption:'本节点使用后续月球着陆器代表展品，嫦娥一号为绕月探测器。'},
 {id:'spacewalk',date:'2008.09.27',era:'走向载人',name:'首次中国航天员出舱',short:'太空迈步',model:'shenzhou',badge:'出舱活动突破',summary:'神舟七号任务中，翟志刚完成中国航天员首次出舱活动。',achievement:'中国掌握航天员出舱活动技术，为空间站舱外安装、巡检和维修打下基础。',principle:'舱外航天服相当于穿在身上的小型生命保障系统，提供压力、氧气与温度控制；安全绳与扶手帮助航天员移动。',facts:[['出舱日期','2008.09.27'],['出舱航天员','翟志刚'],['任务','神舟七号']],source:S.walk,caption:'神舟代表展品 · 出舱活动与空间站建造能力之间的联系。'},
 {id:'change3',date:'2013.12.14',era:'月球与深空',name:'嫦娥三号月面软着陆',short:'落月与巡视',model:'lander',badge:'中国首次软着陆',summary:'嫦娥三号在月球表面软着陆，玉兔号随后开展月面巡视。',achievement:'中国首次实现地外天体软着陆和巡视探测，探月工程从“绕”进入“落”的阶段。',principle:'月球几乎没有大气，着陆器不能依靠降落伞减速。发动机控制下降速度，着陆腿吸收接触月面时的冲击。',facts:[['着陆日期','2013.12.14'],['巡视器','玉兔号'],['成就','月球软着陆与巡视']],source:S.lunar,caption:'月球着陆器科普展品 · 四条缓冲腿、热控包覆与太阳翼。'},
 {id:'change4',date:'2019.01.03',era:'月球与深空',name:'人类首次月背软着陆',short:'月球背面',model:'lander',badge:'人类首次',summary:'嫦娥四号在月球背面着陆，玉兔二号开展巡视探测。',achievement:'实现人类探测器首次月球背面软着陆。借助鹊桥中继星，月背探测器也能与地球通信。',principle:'月球背面无法直接看见地球，中继星在合适的空间位置转发通信，连接月面探测器与地面控制中心。',facts:[['着陆日期','2019.01.03'],['巡视器','玉兔二号'],['通信关键','鹊桥中继星']],source:S.lunar,caption:'月球着陆器代表展品 · 用于解释月背探测，不等同在轨实物 CAD。'},
 {id:'beidou',date:'2020.07.31',era:'服务与探索',name:'北斗三号全球系统开通',short:'北斗服务全球',model:'beidou',badge:'全球导航系统',summary:'北斗三号全球卫星导航系统正式开通，为全球用户提供服务。',achievement:'中国北斗从区域服务迈向全球服务。航天成果进入导航、授时、交通、农业、救灾与日常生活。',principle:'导航卫星播发精确的时间与轨道信息。接收机比较多颗卫星信号的传播时间，求出位置与时间偏差。',facts:[['开通日期','2020.07.31'],['服务范围','全球'],['核心服务','定位 · 导航 · 授时']],source:S.beidou,caption:'导航卫星代表展品 · 星体、天线与对称展开的太阳翼。'},
 {id:'change5',date:'2020.12.17',era:'月球与深空',name:'中国首次月球采样返回',short:'月壤回到地球',model:'lander',badge:'中国首次',summary:'嫦娥五号返回器携带月球样品返回地球。',achievement:'中国首次实现地外天体采样返回。样品进入实验室，让科学家能够用更丰富的仪器研究月球的物质组成与演化历史。',principle:'采样返回要完成落月、采样、月面起飞、月球轨道交会对接和地球返回，一连串环节共同完成往返。',facts:[['返回日期','2020.12.17'],['带回物质','月球样品'],['历史成就','首次地外采样返回']],source:S.lunar,caption:'月球探测代表展品 · 着陆器未按嫦娥五号专用构型复原。'},
 {id:'tianhe',date:'2021.04.29',era:'空间站时代',name:'天和核心舱发射',short:'太空家园启建',model:'station',badge:'空间站核心',summary:'天和核心舱发射，空间站在轨组装建造拉开序幕。',achievement:'空间站的管理与控制中心进入轨道，为航天员长期驻留、实验舱接入和后续空间科学任务建立基础。',principle:'核心舱提供控制、居住和生命保障等功能。对接口连接来访飞船与实验舱，机械臂参与舱外操作。',facts:[['发射日期','2021.04.29'],['舱段','天和核心舱'],['下一站','第二章 · 精细模型']],source:S.tianhe,caption:'空间站三舱构型缩比展品 · 第二章可进入完整模型。',link:'station'},
 {id:'tianwen',date:'2021.05.15',era:'服务与探索',name:'天问一号成功着陆火星',short:'首次火星着陆',model:'beidou',badge:'跨越地月空间',summary:'天问一号着陆巡视器在火星乌托邦平原成功着陆。',achievement:'中国首次火星探测任务实现火星着陆，并由祝融号开展巡视。探测能力从地月系统拓展到行星际空间。',principle:'火星距离遥远，信号传播存在延迟。进入、下降与着陆中的关键动作，需要探测器自主按流程完成。',facts:[['着陆日期','2021.05.15'],['着陆区域','乌托邦平原'],['巡视器','祝融号']],source:S.lunar,caption:'本节点用卫星代表展品讲述远距离测控；不作为天问一号外形复原。'},
 {id:'station',date:'2022.11.03',era:'空间站时代',name:'空间站形成 T 字基本构型',short:'三舱建成',model:'station',badge:'在轨组装成就',summary:'梦天实验舱完成转位，中国空间站形成 T 字基本构型。',achievement:'天和、问天、梦天三舱连接成为在轨实验平台。中国拥有支持长期有人驻留、开展空间科学研究的空间站。',principle:'三舱分工协作：天和负责管理控制与生活支持，问天和梦天提供不同实验设施与舱外载荷支持。',facts:[['形成日期','2022.11.03'],['基本舱段','天和 · 问天 · 梦天'],['构型','T 字形']],source:S.station,caption:'下一章可以拆解三舱、观察透视，并进入实验室与生活区。',link:'station'},
 {id:'change6',date:'2024.06.25',era:'月球与深空',name:'人类首次月背采样返回',short:'月背样品归来',model:'lander',badge:'人类首次',summary:'嫦娥六号返回器携带月球背面样品返回地球。',achievement:'人类首次实现月球背面采样返回，为比较月球正面与背面的物质差异、研究月球演化带来新的实物样本。',principle:'月背采样任务依赖中继通信，还要完成自动采样、月面上升、交会对接和返回。每个环节都服务于把样品带回地球。',facts:[['返回日期','2024.06.25'],['样品来源','月球背面'],['历史成就','人类首次月背采样返回']],source:S.six,caption:'月球探测主题缩比展品 · 样品返回过程以文字解释。'}
];
HISTORY.push(
 {id:'pixing1',date:'2010.09.22',era:'杭州与浙江',local:'杭州 · 浙江大学',name:'浙大皮星一号 A 成功入轨',short:'浙大皮星首飞',model:'beidou',badge:'杭州科研',summary:'浙江大学研制的两颗皮星一号 A 搭载长征二号丁火箭进入轨道。',highlight:'把一颗卫星，做到 3.5 千克。',achievement:'浙大团队历经十年研制，使我国自主研制的公斤级皮卫星进入太空。小卫星同样具备热控、姿控、测控和星务管理能力，推动航天器小型化探索。',principle:'皮卫星将计算、供电、通信和姿态控制集成进很小的体积。减轻质量之外，还要通过环境试验和冗余设计验证可靠性。',facts:[['研制团队','浙江大学'],['单星质量','3.5 千克'],['星体边长','15 厘米']],source:['浙江大学 · 皮星一号 A 完成全部预定任务','https://www.zju.edu.cn/2010/1002/c41533a63901/page.htm'],caption:'三维区为导航卫星代表展品；皮星一号 A 实物请看历史影像。'},
 {id:'pixing2',date:'2015.09.20',era:'杭州与浙江',local:'杭州 · 浙江大学',name:'浙大皮星二号双星发射',short:'双星协同探索',model:'beidou',badge:'杭州科研',summary:'浙江大学研制的皮星二号 A、B 星，搭乘长征六号首飞任务成功发射。',highlight:'从小卫星验证，迈向双星协同。',achievement:'皮星二号在皮卫星平台上承担重要试验任务，探索高精度姿态控制与双星组网。它延续了杭州高校在微小卫星领域的长期积累。',principle:'两颗卫星能够分担探测、通信等任务。组网需要解决相对位置、通信链路和姿态控制等问题，不能只把单星简单复制。',facts:[['研制团队','浙江大学'],['星组','A 星 / B 星'],['运载任务','长征六号首飞']],source:['浙江大学 · 浙大皮星二号成功发射','https://zdzsc.zju.edu.cn/2015/0921/c87256a935052/page.htm'],caption:'三维区为卫星代表展品；并非皮星二号的专用构型。'},
 {id:'zhuque',date:'2023.07.12',era:'杭州与浙江',local:'浙江 · 湖州',name:'朱雀二号液氧甲烷火箭入轨',short:'浙江制造飞向太空',model:'shenzhou',badge:'浙江制造',summary:'朱雀二号遥二火箭发射成功，成为全球首枚成功入轨的液氧甲烷火箭。',highlight:'液氧甲烷火箭，首次成功入轨。',achievement:'蓝箭航天在湖州建设动力研发与制造基地，浙江产业链参与了这项入轨突破。发射发生在酒泉；这里展示的是浙江制造贡献，而不是杭州发射记录。',principle:'液氧提供氧化剂，液态甲烷提供燃料。发动机将燃烧产生的高温燃气加速喷出，推动火箭前进；一次入轨成功不等于已完成重复使用验证。',facts:[['地方联系','湖州动力研发制造'],['推进剂','液氧 / 甲烷'],['发射场','酒泉']],source:['新华网 · 朱雀二号遥二运载火箭发射成功','https://www.xinhuanet.com/video/20230712/14fa154ae00c4efc9fe9b036fcb87e81/c.html'],caption:'三维区为神舟代表展品；朱雀二号外形以历史照片为准。',link:'rocket'},
 {id:'santai',date:'2025.05.14',era:'杭州与浙江',local:'杭州 · 之江实验室',name:'三体计算星座首批 12 星入轨',short:'杭州算力走向太空',model:'beidou',badge:'杭州创新',summary:'之江实验室牵头的三体计算星座首批 12 颗计算卫星发射入轨。',highlight:'让卫星在太空中互联、计算。',achievement:'杭州的科研团队把智能计算与星间互联带入太空。首批卫星入轨标志星座进入组网阶段，为在轨处理数据探索新的路径。',principle:'传统卫星通常先把数据传回地面处理。计算卫星搭载计算设备，通过星间链路协同，让一部分处理工作在轨完成，减少数据下传压力。',facts:[['牵头单位','之江实验室'],['首批卫星','12 颗'],['阶段成就','发射入轨 / 组网起步']],source:['杭州网 · 之江实验室三体计算星座卫星成功发射','https://ori.hangzhou.com.cn/ornews/content/2025-05/15/content_8995396.htm'],caption:'三维区为导航卫星代表展品；计算卫星实物与发射照片见历史影像。'}
);
export const ERAS=['杭州与浙江','全部成就','起步与突破','走向载人','月球与深空','服务与探索','空间站时代'];
const taskReferences={
 dongfanghong:S.early,
 recover:S.early,
 change1:['国家航天局 · 嫦娥一号成功发射','https://www.cnsa.gov.cn/n6758968/n6758972/c6798615/content.html'],
 change3:['国家航天局 · 嫦娥三号软着陆成功','https://www.cnsa.gov.cn/n6758968/n6758972/c6798565/content.html'],
 change4:['国家航天局 · 嫦娥四号月背着陆','https://www.cnsa.gov.cn/n6758823/n6758838/c6805052/content.html'],
 change5:['国家航天局 · 嫦娥五号首次地外采样返回','https://www.cnsa.gov.cn/n6758823/n6758838/c6810872/content.html'],
 tianwen:['国家航天局 · 天问一号落火影像发布','https://www.cnsa.gov.cn/n6758823/n6758838/c6812019/content.html']
};
for(const entry of HISTORY)if(taskReferences[entry.id])entry.source=taskReferences[entry.id];
const highlights={foundation:'从一所研究院，开启飞天事业。',dongfanghong:'中国第一颗人造地球卫星。',recover:'让飞向太空的卫星，回到地球。',project:'载人飞船、空间实验室、空间站。',shenzhou1:'用真实飞行，验证载人航天系统。',shenzhou5:'中国人首次乘自己的飞船进入太空。',change1:'中国首次月球探测任务启航。',spacewalk:'中国航天员，迈出舱外第一步。',change3:'中国首次实现月球软着陆与巡视。',change4:'人类探测器首次软着陆月球背面。',beidou:'中国北斗，服务全球。',change5:'中国首次带回月球样品。',tianhe:'中国空间站，在轨启建。',tianwen:'中国首次火星任务成功着陆。',station:'天和、问天、梦天，三舱相连。',change6:'人类首次带回月球背面样品。'};
for(const entry of HISTORY){entry.highlight ||= highlights[entry.id];entry.local ||= '中国航天 · 国家成就';}
const zhuque=HISTORY.find(d=>d.id==='zhuque');
zhuque.achievement='蓝箭航天在湖州建成民商火箭发动机热试车台，浙江的航天产业能力参与了这项突破。发射发生在酒泉，这里展示浙江对航天发展的贡献。';
zhuque.facts[0]=['地方联系','湖州发动机热试车台'];
zhuque.relatedSources=[['蓝箭航天 · 发展历程与湖州试车台','https://www.landspace.com/about.html']];
HISTORY.sort((a,b)=>a.date.localeCompare(b.date));
