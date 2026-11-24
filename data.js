export const CONFIG = {unit:'m',seed:20231127,referenceDate:'2023-10-30',earthRadius:6371,altitude:400,mu:398600.4418,
  core:{length:16.6,diameter:4.2},wentian:{length:17.9,diameter:4.2,span:55.6},mengtian:{length:17.88,diameter:4.2,span:55.6}};
export const SOURCES = [
 {title:'问天实验舱科学实验设施',by:'中国科学院 · 2022-07-24 / 25',url:'https://www.cas.cn/cm/202207/t20220725_4842822.shtml',desc:'生命生态、生物技术、变重力、科学手套箱与低温存储的功能依据。手套箱和低温存储组合介绍，页面分别设讲解点。'},
 {title:'梦天实验舱的8台科学实验柜',by:'中国科学院 · 2022-10-31',url:'https://www.cas.cn/yw/202210/t20221031_4853222.shtml',desc:'流体、两相、燃烧、高温材料、超冷原子、两组高精度时频和在线维修装调的功能依据。'},
 {title:'走进中国空间站组合体展示舱',by:'央视新闻 · 天津云转载 · 2022-11-10',url:'https://www.tjyun.com/system/2022/11/10/053318698.shtml',desc:'睡袋、阅读灯、收纳、跑台、餐桌和卫生设施的近景参考。画面为航展展示舱，不能等同于在轨精确布置。'},
 {title:'中国空间站全貌高清图像',by:'中国载人航天工程办公室 · 页面标注2023-11-28',url:'https://www.cmse.gov.cn/dmt/tj/tkyxz/202311/t20231127_54720.html',desc:'外形主参考。神舟十六号乘组于2023年10月30日离站后拍摄；采用天和太阳翼转移前构型。',image:'exterior-reference.jpg'},
 {title:'来！一起云游中国空间站',by:'央视新闻 · 2024-04-24',url:'https://news.cctv.cn/2024/04/24/ARTI7nXZm82G6H5KgNuDk9Rl240424.shtml',desc:'设备类别、生活设施与机柜视觉参考。报道包含增强现实呈现，不作为精确工程布置图。',image:'core-room.jpg'},
 {title:'问天之问：十分钟了解问天为何出色',by:'中国载人航天工程办公室 · 2022-07-25',url:'https://www.cmse.gov.cn/xwzx/202207/t20220729_50472.html',desc:'17.9米舱长、4.2米直径、8个机柜机位；气闸外方内圆、3个睡眠区和1个卫生区。',image:'wentian-lab.jpg'},
 {title:'飞天圆梦：213秒了解梦天实验舱',by:'央视新闻 / 中国载人航天工程办公室 · 2022-11-01',url:'https://www.cmse.gov.cn/fxrw/mengtian/mtjj/202211/t20221106_51275.html',desc:'17.88米舱长、机柜类型、双舱嵌套和约1.2米见方的货物出舱口。',image:'mengtian-lab.jpg'},
 {title:'天和核心舱飞行任务新闻发布会',by:'中国载人航天工程办公室 · 2021-04-29',url:'https://www.cmse.gov.cn/fxrw/kjzthhxcrw/zhxw/202105/t20210507_47816.html',desc:'16.6米舱长、4.2米最大直径、节点舱及生活控制段构成。',image:'sleep.jpg'},
 {title:'高分辨率地球与云层纹理',by:'Solar System Scope · CC BY 4.0 · NASA资料衍生',url:'https://www.solarsystemscope.com/textures/',desc:'地表采用8K影像纹理，云层采用独立4K透明层；非实时气象。纹理许可：CC BY 4.0。'},
 {title:'space-radar 开源空间站模型',by:'Sara-Managed-Projects / space-radar · MIT',url:'https://github.com/Sara-Managed-Projects/space-radar',desc:'已下载210 KB简化GLB与MIT许可证，留作外形参考。本项目精细模型为重新建模，并未把简化模型冒充精细模型。'}
];
export const TOPICS = [
 {id:'overview',en:'ORBITAL OBSERVATORY',title:'天宫 · 中国空间站',tag:'三舱基本构型',text:'从地球上空约400公里，看一座持续运转的太空实验室。拖动旋转模型，沿着三舱的连接关系，走进真实报道中的科研与生活空间。',facts:[['天和','16.6 m'],['问天','17.9 m'],['梦天','17.88 m']],principle:'三舱通过节点舱形成T字构型。对接口提供机械连接、密封和电气等接口；转位机构帮助实验舱从前向对接口转到侧向停泊口。',boundary:'以2023年10月30日离站拍摄构型为外形基准；非当前实时在轨配置。'},
 {id:'tianhe',en:'TIANHE · CORE MODULE',title:'天和核心舱',tag:'控制与生活中枢',text:'小柱段连接节点舱，大柱段容纳工作与生活设施，尾部资源舱承载推进与相关设备。这里是空间站的管理和控制中心。',facts:[['舱体长度','16.6 m'],['最大直径','4.2 m'],['主要分区','节点 / 生活 / 资源']],principle:'承压壳保持可供航天员生活的舱内环境；外部防护、隔热材料和散热系统共同保护舱内设备。舱内通道把对接口与各工作区相连。',boundary:'主要外形按报道尺寸制作；壁厚、设备背部管线和家具精确位置为科普示意。'},
 {id:'life',en:'LIVING IN MICROGRAVITY',title:'把日常，带上太空',tag:'生活区 · 天和',text:'独立睡眠空间、折叠餐桌、食品加热与饮水设备、卫生设施和锻炼器械，在紧凑舱段里构成长期驻留的生活环境。',facts:[['独立舱位','3睡眠 / 1卫生'],['运动设施','跑台 / 自行车 / 抗阻'],['日常保障','餐饮 / 收纳 / 医监']],principle:'失重时，睡袋和束缚带帮助身体固定；饮水与卫生设备依靠气流等方式管理液体和废物；锻炼为骨骼与肌肉提供负荷。',boundary:'设施类型来自公开报道；透视布局为科普重建，不代表完整在轨布置。'},
 {id:'wentian',en:'WENTIAN · LIFE SCIENCES',title:'问天实验舱',tag:'面向生命的太空实验室',text:'工作舱里布置生命科学相关机柜。独立气闸舱服务航天员出舱，舱外小机械臂可协助精细操作；同时提供补充生活空间。',facts:[['全长','17.9 m'],['最大直径','4.2 m'],['太阳翼展长','约55 m']],principle:'生命生态、生物技术、变重力科学等机柜，为微重力条件下的实验提供受控环境。科学手套箱提供隔离操作空间，减少样品污染和实验风险。',boundary:'机柜类型按公开资料重建；内部样品、线路和机柜排列做了教学简化。'},
 {id:'mengtian',en:'MENGTIAN · MICROGRAVITY',title:'梦天实验舱',tag:'把地面难以实现的实验带上天',text:'微重力环境下，流体、燃烧、材料和高精度时频实验拥有新的研究条件。货物气闸舱和载荷转移机构连接舱内外实验任务。',facts:[['全长','17.88 m'],['最大直径','4.2 m'],['实验重点','微重力科学']],principle:'流体物理、燃烧科学、高温材料、冷原子等实验机柜隔离不同实验条件。货物气闸舱可在内外舱门互锁的条件下转移舱外载荷。',boundary:'设备功能依据报道；机柜细部为可识别的科普模型，不是可制造图纸。'},
 {id:'power',en:'SOLAR ENERGY & THERMAL CONTROL',title:'一面追光，一面散热',tag:'柔性太阳翼 · 能源系统',text:'大型柔性太阳翼用薄膜式电池阵列收集太阳能，驱动机构调整朝向。白色散热面把设备产生的热量辐射到空间。',facts:[['翼面','柔性电池阵'],['运动','沿根部转轴转动'],['热交换','辐射散热']],principle:'这里的“追日”按钮让翼面法线朝向场景太阳方向；发电指标采用面积×太阳常数×假设效率×入射余弦的教学估算，不是空间站实时功率。',boundary:'电池片、毯面和桁架按外形参考建模；展开和追日为演示。'},
 {id:'arm',en:'EXTRAVEHICULAR OPERATIONS',title:'太空中的双手',tag:'机械臂 · 出舱支持',text:'天和核心舱机械臂与问天实验舱小机械臂，为舱外作业、设备安装与载荷操作提供支持。关节和末端执行器共同完成姿态调整。',facts:[['核心舱机械臂','约10 m'],['问天小机械臂','约5 m'],['可组合','支持协同任务']],principle:'模型按关节链构建，各连杆随其父关节共同运动。演示动作只表达关节工作方式，不对应真实在轨任务轨迹。',boundary:'外观与长度级别依据公开资料，末端夹持机构和运动范围为示意。'},
 {id:'docking',en:'DOCKING & LOGISTICS',title:'从地球来，向太空去',tag:'对接接口 · 载人 / 货运',text:'神舟飞船承担载人往返；天舟货运飞船向空间站补给物资。节点舱和尾部接口使空间站与来访飞行器形成组合体。',facts:[['神舟','轨道 / 返回 / 推进舱'],['天舟','货物 / 资源舱'],['密封接口','连接承压空间']],principle:'对接机构先捕获、缓冲并校正相对姿态，再完成刚性连接和密封。当前动作是沿对接轴的教学演示，未模拟真实交会制导。',boundary:'来访飞船采用2023年基准画面的外形组合示意，不代表当前任务。'}
];
export const RACKS = {
wentian:[['生命生态实验柜','EC','生态与生命支持实验'],['生物技术实验柜','BTR','微重力下的生物技术'],['变重力科学实验柜','VGR','改变样品有效重力条件'],['科学手套箱','GLOVE','隔离操作空间'],['低温存储装置','CRYO','实验样品保存'],['生活保障机柜','ECLSS','舱内环境保障']],
mengtian:[['流体物理实验柜','FLUID','微重力流体界面'],['两相系统实验柜','TWO-PHASE','气液两相与传热'],['燃烧科学实验柜','COMB','微重力燃烧研究'],['高温材料实验柜','MAT','空间材料制备'],['超冷原子物理柜','COLD','超冷原子实验'],['高精度时频柜 I','TIME I','空间时频研究'],['在线维修装调柜','SERVICE','在轨维修与装调'],['高精度时频柜 II','TIME II','空间时频研究']]};
export function orbitState(t,track=1){
 const radius=CONFIG.earthRadius+CONFIG.altitude,omega=Math.sqrt(CONFIG.mu/radius**3),angle=t*omega;
 const incident=track?1:Math.max(0,Math.cos(t*.055));
 return {altitude:CONFIG.altitude,period:2*Math.PI/omega/60,velocity:Math.sqrt(CONFIG.mu/radius),angle,incident,power:4*23*4.5*1361*.27*.8*incident/1000};
}
