import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'

// ─── Types ───────────────────────────────────────────────────────────
type DrillData = {
  topic: string
  warmup: { german: string; chinese: string }
  vocab: { word: string; sentence: string; translation: string }[]
  prompt: { german: string; chinese: string }
  shadow: { german: string; chinese: string }
  debate: {
    question: string
    translation: string
    points: { side: string; text: string }[]
  }
}

type VocabItem = {
  word: string
  sentence: string
  translation: string
  tags: string[]
  mastery: number
}

type Page = 'drill' | 'vocab' | 'phonetic' | 'materials' | 'progress' | 'audio'


// ─── Default Drill (fallback) ─────────────────────────────────────────



const A1_DRILLS: DrillData[] = [
  // 1. Supermarkt (Material 2: Alltag Einkaufen)
  {
    topic: 'Im Supermarkt einkaufen · 超市购物',
    warmup: { german: 'Blaukraut bleibt Blaukraut und Brautkleid bleibt Brautkleid.', chinese: '紫甘蓝还是紫甘蓝，婚纱还是婚纱。（练习/au/音）' },
    vocab: [
      { word: 'der Einkaufswagen', sentence: 'Wo finde ich einen Einkaufswagen?', translation: '购物车在哪里？' },
      { word: 'die Kasse', sentence: 'An welcher Kasse kann ich bezahlen?', translation: '我可以在哪个收银台付款？' },
      { word: 'das Angebot', sentence: 'Dieses Brot ist heute im Angebot.', translation: '这个面包今天特价。' },
      { word: 'frisch', sentence: 'Sind die Tomaten noch frisch?', translation: '这些西红柿还新鲜吗？' },
      { word: 'die Packung', sentence: 'Ich nehme eine Packung Milch.', translation: '我拿一包牛奶。' }
    ],
    prompt: { german: 'Beschreib deinen letzten Einkauf. Was hast du gekauft? Wie viel hast du bezahlt?', chinese: '描述你上次购物的经历。你买了什么？付了多少钱？（目标：60秒口述）' },
    shadow: { german: 'Guten Tag! Kann ich Ihnen helfen? – Ja, ich suche frisches Brot. – Das Brot ist hier in der Ecke. Möchten Sie noch etwas? – Ja, eine Packung Butter und zwei Flaschen Wasser. – Das macht zusammen 8 Euro 50. – Bitte schön. – Danke schön! Tschüss!', chinese: '您好！我能帮您吗？— 是的，我在找新鲜面包。— 面包在那边的角落里。您还要别的吗？— 是的，一包黄油和两瓶水。— 一共8欧元50分。— 给您。— 谢谢！再见！' },
    debate: { question: 'Soll man immer frisch einkaufen oder ist Tiefkühlkost auch okay?', translation: '应该总是买新鲜的，还是冷冻食品也可以？', points: [
      { side: 'Pro', text: 'Frisches Essen ist gesünder und schmeckt besser.' },
      { side: 'Contra', text: 'Frisch einkaufen kostet mehr Zeit und Geld.' },
      { side: 'Pro', text: 'Tiefkühlkost ist praktisch und man wirft weniger weg.' },
      { side: 'Contra', text: 'Tiefkühlkost hat oft weniger Vitamine.' }
    ]}
  },
  // 2. Sich vorstellen (Material 2+5: Selbstvorstellung)
  {
    topic: 'Sich vorstellen · 自我介绍',
    warmup: { german: 'Wenn hinter Fliegen Fliegen fliegen, fliegen Fliegen Fliegen nach.', chinese: '如果苍蝇后面有苍蝇在飞，那么苍蝇会跟着苍蝇飞。（练习/f/和/fl/音）' },
    vocab: [
      { word: 'sich vorstellen', sentence: 'Darf ich mich kurz vorstellen?', translation: '我可以简短介绍一下自己吗？' },
      { word: 'der Wohnort', sentence: 'Mein Wohnort ist München.', translation: '我的居住地是慕尼黑。' },
      { word: 'die Herkunft', sentence: 'Meine Herkunft ist China.', translation: '我来自中国。' },
      { word: 'das Alter', sentence: 'Mein Alter ist 25 Jahre.', translation: '我25岁。' },
      { word: 'die Muttersprache', sentence: 'Meine Muttersprache ist Chinesisch.', translation: '我的母语是中文。' }
    ],
    prompt: { german: 'Stell dich vor! Sage deinen Namen, woher du kommst, wo du wohnst und was dein Hobby ist.', chinese: '介绍一下你自己！说说你的名字、来自哪里、住在哪里、爱好是什么。（目标：60秒口述）' },
    shadow: { german: 'Hallo! Ich heiße Li Wei. Ich komme aus China und wohne jetzt in Berlin. Ich bin 28 Jahre alt. Meine Muttersprache ist Chinesisch, aber ich lerne Deutsch seit einem Jahr. Mein Hobby ist Kochen und Wandern. Freut mich, dich kennenzulernen!', chinese: '你好！我叫李伟。我来自中国，现在住在柏林。我28岁。我的母语是中文，但我学德语已经一年了。我的爱好是烹饪和徒步。很高兴认识你！' },
    debate: { question: 'Ist es wichtig, die Muttersprache zu behalten, wenn man im Ausland lebt?', translation: '在国外生活时，保留母语重要吗？', points: [
      { side: 'Pro', text: 'Die Muttersprache ist Teil der eigenen Identität.' },
      { side: 'Contra', text: 'Man sollte sich voll auf die neue Sprache konzentrieren.' },
      { side: 'Pro', text: 'Zweisprachigkeit ist gut für das Gehirn.' },
      { side: 'Contra', text: 'Wenn man beide Sprachen mischt, lernt man keine richtig.' }
    ]}
  },
  // 3. Beim Arzt (Material 5: ZUM Gesundheit)
  {
    topic: 'Beim Arzt · 看医生',
    warmup: { german: 'Zwischen zwei Zwetschgenzweigen sitzen zwei Schwalben.', chinese: '两只燕子坐在两棵李子树枝之间。（练习/z/和/sch/音）' },
    vocab: [
      { word: 'der Termin', sentence: 'Ich habe einen Termin bei Dr. Müller.', translation: '我和 Müller 医生有约。' },
      { word: 'die Beschwerden', sentence: 'Welche Beschwerden haben Sie?', translation: '您有什么不适？' },
      { word: 'das Fieber', sentence: 'Ich habe seit gestern Fieber.', translation: '我从昨天开始发烧。' },
      { word: 'die Tablette', sentence: 'Nehmen Sie diese Tabletten dreimal am Tag.', translation: '这些药片每天服用三次。' },
      { word: 'sich ausruhen', sentence: 'Sie sollten sich ein paar Tage ausruhen.', translation: '您应该休息几天。' }
    ],
    prompt: { german: 'Du bist krank und gehst zum Arzt. Beschreib deine Symptome und was der Arzt dir gesagt hat.', chinese: '你生病了去看医生。描述你的症状和医生对你说的话。（目标：60秒口述）' },
    shadow: { german: 'Guten Morgen, Frau Müller. Was kann ich für Sie tun? – Guten Morgen, Doktor. Ich fühle mich seit drei Tagen nicht gut. Ich habe Kopfschmerzen und Husten. – Haben Sie Fieber? – Ja, gestern hatte ich 38,5 Grad. – Ich höre mal kurz Ihre Lunge. Atmen Sie tief ein. – Ja, Doktor. – Das ist eine leichte Erkältung. Ich gebe Ihnen ein Rezept. Trinken Sie viel und ruhen Sie sich aus!', chinese: '早上好，Müller 女士。我能为您做什么？— 早上好，医生。我这三天感觉不舒服。我头痛还咳嗽。— 您发烧吗？— 是的，昨天我38.5度。— 让我听一下您的肺部。深呼吸。— 好的，医生。— 这是轻微感冒。我给您开个处方。多喝水，好好休息！' },
    debate: { question: 'Soll man bei einer Erkältung sofort zum Arzt gehen oder erst zu Hause bleiben?', translation: '感冒时应该立刻去看医生，还是先在家休息？', points: [
      { side: 'Pro (Arzt)', text: 'Ein Arzt kann schnell die richtige Diagnose stellen.' },
      { side: 'Contra (Arzt)', text: 'Im Wartezimmer steckt man sich noch mehr an.' },
      { side: 'Pro (Zuhause)', text: 'Ruhe und viel Trinken helfen oft am besten.' },
      { side: 'Contra (Zuhause)', text: 'Ohne Arzt kann eine kleine Erkältung schlimmer werden.' }
    ]}
  },
  // 4. Im Restaurant (Material 3: Slow German Restaurant)
  {
    topic: 'Im Restaurant · 餐厅点餐',
    warmup: { german: 'Schneiders Schneider schneidet schicke Schuhe.', chinese: '施奈德的裁缝剪裁时髦的鞋子。（练习/sch/音）' },
    vocab: [
      { word: 'die Speisekarte', sentence: 'Könnten wir bitte die Speisekarte sehen?', translation: '我们可以看一下菜单吗？' },
      { word: 'die Reservierung', sentence: 'Ich habe eine Reservierung auf den Namen Li.', translation: '我有一个预约，姓李。' },
      { word: 'die Rechnung', sentence: 'Die Rechnung, bitte!', translation: '请结账！' },
      { word: 'vegetarisch', sentence: 'Haben Sie auch vegetarische Gerichte?', translation: '你们也有素食菜品吗？' },
      { word: 'das Trinkgeld', sentence: 'In Deutschland gibt man etwa 10 Prozent Trinkgeld.', translation: '在德国一般给约10%的小费。' }
    ],
    prompt: { german: 'Beschreib dein Lieblingsrestaurant. Was bestellst du dort immer? Wie ist das Essen?', chinese: '描述你最喜欢的餐厅。你在那里总是点什么？食物怎么样？（目标：60秒口述）' },
    shadow: { german: 'Guten Abend! Haben Sie reserviert? – Ja, einen Tisch für zwei Personen. – Bitte schön, hier entlang. Hier ist die Speisekarte. – Danke. Ich nehme die Tomatensuppe und das Wiener Schnitzel. – Sehr gerne. Möchten Sie auch etwas trinken? – Ja, ein großes Mineralwasser, bitte. – Alles klar. Das kommt sofort!', chinese: '晚上好！您有预约吗？— 是的，两人桌。— 请这边走。这是菜单。— 谢谢。我要番茄汤和维也纳炸肉排。— 好的。您想喝点什么？— 是的，一大瓶矿泉水，谢谢。— 好的。马上来！' },
    debate: { question: 'Soll man in Restaurants immer Trinkgeld geben?', translation: '在餐厅应该总是给小费吗？', points: [
      { side: 'Pro', text: 'Das Servicepersonal verdient oft wenig und braucht das Trinkgeld.' },
      { side: 'Contra', text: 'Das Essen ist schon teuer genug, da muss man nicht noch extra zahlen.' },
      { side: 'Pro', text: 'Trinkgeld ist eine Anerkennung für guten Service.' },
      { side: 'Contra', text: 'In manchen Ländern ist Trinkgeld unhöflich.' }
    ]}
  },
  // 5. Nach dem Weg fragen (Material 2: Alltag)
  {
    topic: 'Nach dem Weg fragen · 问路',
    warmup: { german: 'Bäcker backt braune Bretzeln.', chinese: '面包师烤棕色碱水结。（练习/b/和/br/音）' },
    vocab: [
      { word: 'die Richtung', sentence: 'In welche Richtung muss ich gehen?', translation: '我应该往哪个方向走？' },
      { word: 'die Kreuzung', sentence: 'Gehen Sie bis zur nächsten Kreuzung.', translation: '走到下一个十字路口。' },
      { word: 'geradeaus', sentence: 'Gehen Sie geradeaus und dann links.', translation: '直走然后左转。' },
      { word: 'die Ampel', sentence: 'An der Ampel sehen Sie die Bank.', translation: '在红绿灯处您会看到银行。' },
      { word: 'entlang', sentence: 'Gehen Sie den Fluss entlang.', translation: '沿着河边走。' }
    ],
    prompt: { german: 'Ein Tourist fragt dich nach dem Weg zum Bahnhof. Erkläre ihm den Weg.', chinese: '一个游客问你火车站怎么走。给他指路。（目标：60秒口述）' },
    shadow: { german: 'Entschuldigung, wie komme ich zum Hauptbahnhof? – Gehen Sie hier geradeaus bis zur dritten Kreuzung. Dann biegen Sie rechts ab. Gehen Sie etwa 200 Meter weiter. Die Bahnhofshalle ist auf der linken Seite. Sie können sie nicht verfehlen. – Vielen Dank! – Gern geschehen!', chinese: '不好意思，请问火车站怎么走？— 从这里直走到第三个十字路口。然后右转。再走大约200米。火车站大厅在左手边。您不会错过的。— 非常感谢！— 不客气！' },
    debate: { question: 'Ist es besser, sich den Weg zu merken oder immer das Navi zu benutzen?', translation: '记路线好还是总是用导航好？', points: [
      { side: 'Pro (merken)', text: 'Wenn man sich den Weg merkt, lernt man die Stadt besser kennen.' },
      { side: 'Contra (merken)', text: 'In einer fremden Stadt ist das Navi sicherer.' },
      { side: 'Pro (Navi)', text: 'Das Navi zeigt immer den schnellsten Weg.' },
      { side: 'Contra (Navi)', text: 'Wer immer auf das Navi schaut, verpasst die Umgebung.' }
    ]}
  },
  // 6. Freizeit und Hobbys (Material 2)
  {
    topic: 'Freizeit und Hobbys · 爱好与休闲',
    warmup: { german: 'Fischers Fritz fischt frische Fische.', chinese: '渔夫的弗里茨钓新鲜的鱼。（经典绕口令）' },
    vocab: [
      { word: 'die Freizeit', sentence: 'In meiner Freizeit lese ich gerne Bücher.', translation: '我在空闲时间喜欢看书。' },
      { word: 'das Hobby', sentence: 'Mein Hobby ist Fotografieren.', translation: '我的爱好是摄影。' },
      { word: 'sich treffen', sentence: 'Wir treffen uns am Wochenende.', translation: '我们周末见面。' },
      { word: 'der Film', sentence: 'Möchtest du mit ins Kino kommen?', translation: '你想一起去看电影吗？' },
      { word: 'spazieren gehen', sentence: 'Ich gehe jeden Abend spazieren.', translation: '我每天晚上散步。' }
    ],
    prompt: { german: 'Was machst du am Wochenende? Erzähl von deinen Plänen.', chinese: '你周末做什么？讲讲你的计划。（目标：60秒口述）' },
    shadow: { german: 'Hallo Anna! Was machst du am Samstag? – Ich habe noch keine Pläne. Und du? – Ich gehe ins Kino. Möchtest du mitkommen? – Ja, gerne! Welchen Film schauen wir? – Einen neuen Actionfilm. Er fängt um 20 Uhr an. – Super! Treffen wir uns vorher zum Essen? – Gute Idee! Um 18 Uhr im Italiener?', chinese: '嗨 Anna！你周六做什么？— 我还没有计划。你呢？— 我要去看电影。你想一起来吗？— 好啊！我们看什么电影？— 一部新的动作片。晚上8点开始。— 太好了！我们要不要先吃饭？— 好主意！6点在意大利餐厅见？' },
    debate: { question: 'Ist es besser, am Wochenende zu Hause zu bleiben oder unterwegs zu sein?', translation: '周末待在家里好还是出门好？', points: [
      { side: 'Pro (Zuhause)', text: 'Zu Hause kann man richtig entspannen und Energie tanken.' },
      { side: 'Contra (Zuhause)', text: 'Wer nur zu Hause sitzt, verpasst viele Erlebnisse.' },
      { side: 'Pro (unterwegs)', text: 'Neue Erfahrungen machen das Leben interessanter.' },
      { side: 'Contra (unterwegs)', text: 'Unterwegs sein ist oft teuer und anstrengend.' }
    ]}
  },
  // 7. Wohnen und Miete (Material 2)
  {
    topic: 'Wohnen und Miete · 住房与租房',
    warmup: { german: 'Der Cottbusser Postkutscher putzt den Cottbusser Postkutschkasten.', chinese: '科特布斯的邮车夫擦拭科特布斯的邮车箱。（练习/k/和/p/音）' },
    vocab: [
      { word: 'die Miete', sentence: 'Die Miete in Berlin ist sehr hoch.', translation: '柏林的房租很高。' },
      { word: 'die Wohnung', sentence: 'Ich suche eine Wohnung mit zwei Zimmern.', translation: '我在找一套两居室的公寓。' },
      { word: 'der Nachbar', sentence: 'Meine Nachbarn sind sehr nett.', translation: '我的邻居们很好。' },
      { word: 'möbliert', sentence: 'Ist die Wohnung möbliert oder unmöbliert?', translation: '这套公寓是带家具的还是不带家具的？' },
      { word: 'der Mietvertrag', sentence: 'Bitte lesen Sie den Mietvertrag genau.', translation: '请仔细阅读租房合同。' }
    ],
    prompt: { german: 'Beschreib deine Wohnung. Wie viele Zimmer hat sie? Was ist dein Lieblingsplatz?', chinese: '描述你的公寓。有几个房间？你最喜欢的地方是哪里？（目标：60秒口述）' },
    shadow: { german: 'Guten Tag! Ich interessiere mich für die Wohnung. – Ja, sie hat zwei Zimmer, eine Küche und ein Bad. – Ist sie möbliert? – Nein, aber es gibt einen Einbauküche. – Wie hoch ist die Miete? – 850 Euro warm. – Kann ich mir die Wohnung ansehen? – Natürlich! Wann haben Sie Zeit?', chinese: '您好！我对这套公寓感兴趣。— 是的，它有两个房间、一个厨房和一个浴室。— 带家具吗？— 不，但有一个整体厨房。— 房租多少？— 850欧元全包。— 我可以看房吗？— 当然！您什么时候有时间？' },
    debate: { question: 'Ist es besser, eine Wohnung zu mieten oder zu kaufen?', translation: '租房好还是买房好？', points: [
      { side: 'Pro (mieten)', text: 'Mieten gibt mehr Flexibilität, umzuziehen.' },
      { side: 'Contra (mieten)', text: 'Beim Mieten zahlt man Geld aus, ohne etwas zu besitzen.' },
      { side: 'Pro (kaufen)', text: 'Eine eigene Wohnung ist eine gute Investition.' },
      { side: 'Contra (kaufen)', text: 'Kaufen bindet viel Kapital und man kann nicht so leicht umziehen.' }
    ]}
  }
]

// Pick drill based on day of month
function getTodayDrill(): DrillData {
  const day = new Date().getDate()
  return A1_DRILLS[day % A1_DRILLS.length]
}

const DEFAULT_DRILL = getTodayDrill()

// ─── Default Vocab Bank ──────────────────────────────────────────────
const DEFAULT_VOCAB: VocabItem[] = [
  // Material 2+5: Sich vorstellen / Persönliche Info
  { word: 'sich vorstellen', sentence: 'Darf ich mich kurz vorstellen?', translation: '我可以简短介绍一下自己吗？', tags: ['alltag'], mastery: 90 },
  { word: 'der Wohnort', sentence: 'Mein Wohnort ist Berlin.', translation: '我的居住地是柏林。', tags: ['alltag'], mastery: 85 },
  { word: 'die Herkunft', sentence: 'Meine Herkunft ist China.', translation: '我来自中国。', tags: ['alltag'], mastery: 80 },
  { word: 'die Muttersprache', sentence: 'Meine Muttersprache ist Chinesisch.', translation: '我的母语是中文。', tags: ['alltag'], mastery: 75 },
  // Material 2: Einkaufen / Alltag
  { word: 'der Einkaufswagen', sentence: 'Wo finde ich einen Einkaufswagen?', translation: '购物车在哪里？', tags: ['alltag'], mastery: 70 },
  { word: 'die Kasse', sentence: 'An welcher Kasse kann ich bezahlen?', translation: '我可以在哪个收银台付款？', tags: ['alltag'], mastery: 65 },
  { word: 'das Angebot', sentence: 'Dieses Brot ist heute im Angebot.', translation: '这个面包今天特价。', tags: ['alltag'], mastery: 60 },
  { word: 'frisch', sentence: 'Sind die Tomaten noch frisch?', translation: '这些西红柿还新鲜吗？', tags: ['alltag'], mastery: 55 },
  { word: 'die Packung', sentence: 'Ich nehme eine Packung Milch.', translation: '我拿一包牛奶。', tags: ['alltag'], mastery: 50 },
  // Material 5: Beim Arzt / Gesundheit
  { word: 'der Termin', sentence: 'Ich habe einen Termin bei Dr. Müller.', translation: '我和 Müller 医生有约。', tags: ['alltag'], mastery: 45 },
  { word: 'die Beschwerden', sentence: 'Welche Beschwerden haben Sie?', translation: '您有什么不适？', tags: ['alltag'], mastery: 40 },
  { word: 'das Fieber', sentence: 'Ich habe seit gestern Fieber.', translation: '我从昨天开始发烧。', tags: ['alltag'], mastery: 35 },
  { word: 'die Tablette', sentence: 'Nehmen Sie diese Tabletten dreimal am Tag.', translation: '这些药片每天服用三次。', tags: ['alltag'], mastery: 30 },
  { word: 'sich ausruhen', sentence: 'Sie sollten sich ein paar Tage ausruhen.', translation: '您应该休息几天。', tags: ['alltag'], mastery: 25 },
  // Material 3: Restaurant / Essen
  { word: 'die Speisekarte', sentence: 'Könnten wir bitte die Speisekarte sehen?', translation: '我们可以看一下菜单吗？', tags: ['alltag'], mastery: 20 },
  { word: 'die Rechnung', sentence: 'Die Rechnung, bitte!', translation: '请结账！', tags: ['alltag'], mastery: 15 },
  { word: 'vegetarisch', sentence: 'Haben Sie auch vegetarische Gerichte?', translation: '你们也有素食菜品吗？', tags: ['alltag'], mastery: 15 },
  // Material 2: Weg fragen / Verkehr
  { word: 'die Richtung', sentence: 'In welche Richtung muss ich gehen?', translation: '我应该往哪个方向走？', tags: ['alltag'], mastery: 15 },
  { word: 'die Kreuzung', sentence: 'Gehen Sie bis zur nächsten Kreuzung.', translation: '走到下一个十字路口。', tags: ['alltag'], mastery: 15 },
  { word: 'geradeaus', sentence: 'Gehen Sie geradeaus und dann links.', translation: '直走然后左转。', tags: ['alltag'], mastery: 15 },
  // Material 2: Wohnen
  { word: 'die Miete', sentence: 'Die Miete in Berlin ist sehr hoch.', translation: '柏林的房租很高。', tags: ['alltag'], mastery: 15 },
  { word: 'die Wohnung', sentence: 'Ich suche eine Wohnung mit zwei Zimmern.', translation: '我在找一套两居室的公寓。', tags: ['alltag'], mastery: 15 },
  { word: 'möbliert', sentence: 'Ist die Wohnung möbliert?', translation: '这套公寓带家具吗？', tags: ['alltag'], mastery: 15 },
  // Material 2: Freizeit
  { word: 'die Freizeit', sentence: 'In meiner Freizeit lese ich gerne Bücher.', translation: '我在空闲时间喜欢看书。', tags: ['alltag'], mastery: 15 },
  { word: 'das Hobby', sentence: 'Mein Hobby ist Fotografieren.', translation: '我的爱好是摄影。', tags: ['alltag'], mastery: 15 },
  { word: 'spazieren gehen', sentence: 'Ich gehe jeden Abend spazieren.', translation: '我每天晚上散步。', tags: ['alltag'], mastery: 15 },
  { word: 'der Zeitgeist', sentence: 'Das spiegelt den aktuellen Zeitgeist wider.', translation: '反映时代精神', tags: ['kultur'], mastery: 15 },
]

// ─── Helpers ─────────────────────────────────────────────────────────
const STORAGE_KEY = 'deutsch-lernen-data-v1'

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveData(data: any) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function speakGerman(text: string) {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) return
  try {
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'de-DE'
    utter.rate = 0.85
    utter.pitch = 1.0
    const voices = window.speechSynthesis.getVoices()
    const de = voices.find(v => v.lang === 'de-DE') || voices.find(v => v.lang?.startsWith('de'))
    if (de) utter.voice = de
    window.speechSynthesis.speak(utter)
  } catch {}
}

function useTimer(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(true)
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setRunning(false)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }, [])

  const reset = useCallback((s: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
    setSeconds(s)
  }, [])

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  const display = `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`
  return { seconds, running, display, start, reset }
}

// ─── Drill Page ──────────────────────────────────────────────────────
function DrillPage({ data }: { data: DrillData }) {
  const promptTimer = useTimer(60)
  const debateTimer = useTimer(90)
  const [drillProgress, setDrillProgress] = useState(0)

  const markProgress = (step: number) => setDrillProgress(p => Math.max(p, step * 20))

  return (
    <div className="space-y-3 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-amber-400">🎯 Heutiges Sprechtraining</h1>
        <span className="text-xs text-slate-400">{new Date().toLocaleDateString('de-DE',{weekday:'short',month:'short',day:'numeric'})}</span>
      </div>
      <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10">🔥 {data.topic}</Badge>
      <Progress value={drillProgress} className="h-1" />

      {/* Warmup */}
      <Card className="border-l-4 border-l-red-500 bg-slate-900 border-slate-700">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-amber-400">🔥 Aufwärmung · 绕口令</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm font-medium">{data.warmup.german}</p>
          <p className="text-xs text-slate-400">{data.warmup.chinese}</p>
          <Button size="sm" className="bg-amber-500 text-slate-950 hover:bg-amber-400" onClick={() => { speakGerman(data.warmup.german); markProgress(1) }}>🔊 朗读跟读</Button>
        </CardContent>
      </Card>

      {/* Vocab */}
      <Card className="border-l-4 border-l-green-500 bg-slate-900 border-slate-700">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-amber-400">💥 Vokabel-Explosion · 5 个表达</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2">
            {data.vocab.map((v, i) => (
              <div key={i} className="bg-slate-950 rounded-lg p-3 border border-slate-800 relative">
                <span className="text-amber-400 font-semibold text-sm">{v.word}</span>
                <p className="text-xs text-slate-300 mt-1">{v.sentence}</p>
                <p className="text-xs text-slate-500">{v.translation}</p>
                <button className="absolute top-2 right-2 text-amber-400 text-xs bg-amber-500/10 rounded-full w-6 h-6 flex items-center justify-center" onClick={() => speakGerman(v.word)}>🔊</button>
              </div>
            ))}
          </div>
          <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-500" onClick={() => markProgress(2)}>✅ 词汇完成</Button>
        </CardContent>
      </Card>

      {/* Prompt */}
      <Card className="border-l-4 border-l-blue-500 bg-slate-900 border-slate-700">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-amber-400">🎤 Sprech-Prompt · 开口说</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm font-medium">{data.prompt.german}</p>
          <p className="text-xs text-slate-400">{data.prompt.chinese}</p>
          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500" onClick={() => { promptTimer.start(); markProgress(3) }} disabled={promptTimer.running}>
              {promptTimer.running ? `⏱️ ${promptTimer.display}` : '⏱️ 60秒计时'}
            </Button>
            {promptTimer.running && <span className="font-mono text-amber-400 text-lg">{promptTimer.display}</span>}
          </div>
        </CardContent>
      </Card>

      {/* Shadow */}
      <Card className="border-l-4 border-l-purple-500 bg-slate-900 border-slate-700">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-amber-400">🎧 Schatten-Training · 跟读</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm font-medium">{data.shadow.german}</p>
          <p className="text-xs text-slate-400">{data.shadow.chinese}</p>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-500" onClick={() => { speakGerman(data.shadow.german); markProgress(4) }}>🔊 播放并跟读</Button>
        </CardContent>
      </Card>

      {/* Debate */}
      <Card className="border-l-4 border-l-pink-500 bg-slate-900 border-slate-700">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-amber-400">⚔️ Mini-Debatte · 辩论</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm font-medium">{data.debate.question}</p>
          <p className="text-xs text-slate-400">{data.debate.translation}</p>
          <div className="space-y-1">
            {data.debate.points.map((p, i) => (
              <div key={i} className="bg-slate-950 rounded-md p-2 text-xs border-l-2 border-l-amber-500">
                <span className="text-amber-400 font-bold">{p.side}</span> {p.text}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="bg-pink-600 hover:bg-pink-500" onClick={() => { debateTimer.start(); markProgress(5) }} disabled={debateTimer.running}>
              {debateTimer.running ? `⏱️ ${debateTimer.display}` : '⏱️ 90秒计时'}
            </Button>
            {debateTimer.running && <span className="font-mono text-amber-400 text-lg">{debateTimer.display}</span>}
          </div>
        </CardContent>
      </Card>


      {/* Check-in */}
      {drillProgress >= 80 && (
        <Card className="bg-slate-900 border-slate-700 border-l-4 border-l-green-500">
          <CardContent className="p-4 text-center space-y-2">
            <div className="text-2xl">🎉</div>
            <p className="text-sm font-bold text-green-400">Training fast geschafft!</p>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-500"
              onClick={() => {
                const today = new Date()
                const dateStr = today.toISOString().split('T')[0]
                const dayNum = today.getDate()
                const raw = localStorage.getItem('deutsch-progress')
                const prog = raw ? JSON.parse(raw) : { streak: 0, bestStreak: 0, totalMinutes: 0, totalVocab: 0, masteredVocab: 0, doneDays: [], lastPracticeDate: null }
                
                prog.totalMinutes += 30
                prog.totalVocab += data.vocab.length
                prog.masteredVocab += Math.floor(data.vocab.length * 0.6)
                
                if (prog.lastPracticeDate) {
                  const last = new Date(prog.lastPracticeDate)
                  const diff = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
                  if (diff === 1) {
                    prog.streak += 1
                  } else if (diff > 1) {
                    prog.streak = 1
                  }
                } else {
                  prog.streak = 1
                }
                if (prog.streak > prog.bestStreak) prog.bestStreak = prog.streak
                prog.lastPracticeDate = dateStr
                
                if (!prog.doneDays.includes(dayNum)) {
                  prog.doneDays.push(dayNum)
                }
                
                localStorage.setItem('deutsch-progress', JSON.stringify(prog))
                alert('✅ 打卡成功！Fortschritt gespeichert.')
              }}
            >
              ✅ 完成今日训练并打卡
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Vocab Page ──────────────────────────────────────────────────────
function VocabPage({ vocab }: { vocab: VocabItem[] }) {
  const [filter, setFilter] = useState('all')
  const tags = ['all', 'alltag', 'arbeit', 'kultur', 'umgang', 'debatte']
  const filtered = filter === 'all' ? vocab : vocab.filter(v => v.tags.includes(filter))

  return (
    <div className="space-y-3 pb-24">
      <h1 className="text-lg font-bold text-amber-400">🏦 Wortbank · 词汇银行</h1>
      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-slate-900 border-slate-700 text-center p-2"><div className="text-xl font-bold text-amber-400">{vocab.length}</div><div className="text-[10px] text-slate-400">总词汇</div></Card>
        <Card className="bg-slate-900 border-slate-700 text-center p-2"><div className="text-xl font-bold text-green-400">{vocab.filter(v=>v.mastery>70).length}</div><div className="text-[10px] text-slate-400">已掌握</div></Card>
        <Card className="bg-slate-900 border-slate-700 text-center p-2"><div className="text-xl font-bold text-blue-400">5</div><div className="text-[10px] text-slate-400">今日新增</div></Card>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(t => (
          <button key={t} onClick={() => setFilter(t)} className={`text-xs px-2.5 py-1 rounded-full border transition ${filter===t ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
            {t === 'all' ? '全部' : t === 'alltag' ? '日常' : t === 'arbeit' ? '工作' : t === 'kultur' ? '文化' : t === 'umgang' ? '口语' : '辩论'}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map((v, i) => (
          <Card key={i} className="bg-slate-900 border-slate-700">
            <CardContent className="p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-semibold text-sm">{v.word}</span>
                <button className="text-amber-400 text-xs bg-amber-500/10 rounded-full w-6 h-6 flex items-center justify-center" onClick={() => speakGerman(v.word)}>🔊</button>
              </div>
              <p className="text-xs text-slate-300">{v.sentence}</p>
              <p className="text-xs text-slate-500">{v.translation}</p>
              <div className="flex gap-1 mt-1">{v.tags.map(t => <span key={t} className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-500">#{t}</span>)}</div>
              <Progress value={v.mastery} className="h-1 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── Phonetic Page ───────────────────────────────────────────────────
function PhoneticPage() {
  return (
    <div className="space-y-3 pb-24">
      <h1 className="text-lg font-bold text-amber-400">🎙️ Aussprache-Labor · 发音实验室</h1>
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-2"><CardTitle className="text-xs text-slate-400 uppercase tracking-wider">Heutiger Fokus · 今日聚焦</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="text-2xl font-bold text-amber-400">/ç/ vs /x/</div>
          <p className="text-xs text-slate-300 leading-relaxed">德语中的清软腭擦音和清硬腭擦音是中文母语者最容易混淆的一对音。/ç/ 类似"西"的起始音（ich），/x/ 类似"喝"的声门音（Bach）。</p>
          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 space-y-1">
            <p className="text-sm">Ich lache, weil ich in Bach falle.</p>
            <p className="text-xs font-mono text-amber-400">[ɪç ˈlaxə, vaɪl ɪç ɪn ˈbax ˈfalə]</p>
            <p className="text-xs text-slate-500">我笑了，因为我掉进了小溪里。</p>
          </div>
          <Button size="sm" className="bg-amber-500 text-slate-950 hover:bg-amber-400" onClick={() => speakGerman('Ich lache, weil ich in Bach falle.')}>🔊 示范音频</Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-amber-400">🎯 Minimalpaare · 最小对立对</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {[
              {w:'ich',ipa:'[ɪç]',m:'我'},
              {w:'ach',ipa:'[ax]',m:'啊'},
              {w:'Kirche',ipa:'[ˈkɪʁçə]',m:'教堂'},
              {w:'Buch',ipa:'[buːx]',m:'书'},
              {w:'mich',ipa:'[mɪç]',m:'我（宾格）'},
              {w:'doch',ipa:'[dɔx]',m:'但是'},
            ].map((p,i) => (
              <div key={i} className="bg-slate-950 rounded-lg p-2 text-center border border-slate-800" onClick={() => speakGerman(p.w)}>
                <div className="text-amber-400 font-bold">{p.w}</div>
                <div className="text-[10px] font-mono text-amber-500">{p.ipa}</div>
                <div className="text-[10px] text-slate-500">{p.m}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Materials Page ──────────────────────────────────────────────────
function MaterialsPage() {
  const [text, setText] = useState('')
  const [parsed, setParsed] = useState<{
    title: string
    lessonNum: string
    phrases: {german: string; chinese: string; context: string}[]
    dialogues: {speaker: string; chinese: string; german: string}[]
    substitutions: {original: string; replacement: string; meaning: string}[]
    extendedPrompt: {german: string; chinese: string}
  } | null>(null)
  const [parsing, setParsing] = useState(false)
  const [savedMaterials, setSavedMaterials] = useState<any[]>([])

  useEffect(() => {
    const raw = localStorage.getItem('deutsch-materials')
    if (raw) setSavedMaterials(JSON.parse(raw))
  }, [])

  const saveMaterial = (material: any) => {
    const updated = [material, ...savedMaterials].slice(0, 20)
    localStorage.setItem('deutsch-materials', JSON.stringify(updated))
    setSavedMaterials(updated)
  }


  const extractPhrases = (german: string, chinese: string): {german: string; chinese: string; context: string}[] => {
    const phrases: {german: string; chinese: string; context: string}[] = []
    const collocations = [
      {de: /\b(Verspätung\s+haben)\b/gi, zh: '晚点'},
      {de: /\b(zu\s+spät\s+kommen)\b/gi, zh: '迟到'},
      {de: /\b(die\s+Besprechung\s+verpassen)\b/gi, zh: '错过会议'},
      {de: /\b(es\s+war\s+mir\s+(ein\s+bisschen\s+)?unangenehm)\b/gi, zh: '我觉得不好意思'},
      {de: /\b(sich\s+etwas\s+holen)\b/gi, zh: '买/办某物'},
      {de: /\b(sich\s+etwas\s+kaufen)\b/gi, zh: '购买某物'},
      {de: /\b(darüber\s+nachdenken)\b/gi, zh: '考虑'},
      {de: /\b(auf\s+\d+\s+Uhr\s+verschieben)\b/gi, zh: '改到几点'},
      {de: /\b(es\s+rechtzeitig\s+schaffen)\b/gi, zh: '及时赶到'},
      {de: /\b(Hoffentlich\s+.+?nicht\s+wieder)\b/gi, zh: '希望不要再...'},
      {de: /\b(ein\s+Problem\s+geben)\b/gi, zh: '出问题'},
      {de: /\b(sauer\s+sein)\b/gi, zh: '生气'},
      {de: /\b(trotzdem\s+\w+)\b/gi, zh: '尽管如此还是...'},
      {de: /\b(extra\s+früh)\b/gi, zh: '特意很早'},
      {de: /\b(noch\s+früher)\b/gi, zh: '更早'},
      {de: /\b(zu\s+weit\s+weg)\b/gi, zh: '太远'},
      {de: /\b(Monatskarte\s+kaufen)\b/gi, zh: '买月票'},
      {de: /\b(mit\s+Bus\s+und\s+U-Bahn\s+fahren)\b/gi, zh: '坐公交和地铁'},
      {de: /\b(ich\s+habe\s+gehört,\s+dass)\b/gi, zh: '我听说...'},
      {de: /\b(es\s+gab\s+sicherlich)\b/gi, zh: '肯定出了...'},
      {de: /\b(Das\s+ist\s+ja\s+praktisch)\b/gi, zh: '这真方便'},
      {de: /\b(ich\s+habe\s+mir\s+.+?\s+gekauft)\b/gi, zh: '我买了...'},
      {de: /\b(Damit\s+kann\s+ich\s+.+?\s+fahren)\b/gi, zh: '用这个我可以坐...'},
      {de: /\b(Mit\s+dem\s+Fahrrad\s+schaffe\s+ich\s+das\s+nicht)\b/gi, zh: '骑车我做不到'},
      {de: /\b(Bei\s+sowas\s+ist\s+man\s+dann\s+schneller)\b/gi, zh: '这样的话更快'},
      {de: /\b(Wenn\s+es\s+morgen\s+wieder\s+so\s+ist)\b/gi, zh: '如果明天还是这样'},
      {de: /\b(nur\s+sehr\s+langsam\s+weitergehen)\b/gi, zh: '只能慢慢前进'},
      {de: /\b(einen\s+kleinen\s+Unfall\s+gab)\b/gi, zh: '发生了小事故'},
      {de: /\b(ewig\s+nicht\s+losfahren)\b/gi, zh: '很久不开动'},
      {de: /\b(fast\s+zu\s+spät\s+gekommen)\b/gi, zh: '差点迟到'},
      {de: /\b(losfahren|abfahren|ankommen|aufstehen|einsteigen|aussteigen)\b/gi, zh: '(车)开动/出发/到达/起床/上车/下车'},
      {de: /\b(weitergehen|vorbeikommen|zurückkommen|mitkommen)\b/gi, zh: '继续走/路过/回来/一起来'},
    ]
    for (const col of collocations) {
      let m: RegExpExecArray | null
      while ((m = col.de.exec(german)) !== null) {
        if (!phrases.some(p => p.german === m![0])) {
          phrases.push({ german: m![0], chinese: col.zh, context: chinese })
        }
      }
    }
    return phrases.slice(0, 18)
  }

  const generateSubstitutions = (dialogues: {speaker: string; chinese: string; german: string}[]) => {
    const subs: {original: string; replacement: string; meaning: string}[] = []
    const allGerman = dialogues.map(d => d.german).join(' ')
    const patterns = [
      { from: /U-Bahn/gi, to: 'Bus', meaning: '地铁 → 公交' },
      { from: /Bus/gi, to: 'Zug', meaning: '公交 → 火车' },
      { from: /Chef/gi, to: 'Kollege', meaning: '老板 → 同事' },
      { from: /Besprechung/gi, to: 'Termin', meaning: '会议 → 约会' },
      { from: /Fahrrad/gi, to: 'Auto', meaning: '自行车 → 汽车' },
      { from: /Monatskarte/gi, to: 'Tageskarte', meaning: '月票 → 日票' },
      { from: /früh/gi, to: 'spät', meaning: '早 → 晚' },
      { from: /schnell/gi, to: 'langsam', meaning: '快 → 慢' },
      { from: /Innenstadt/gi, to: 'Stadtzentrum', meaning: '市中心 → 市中心(同义)' },
      { from: /Unfall/gi, to: 'Problem', meaning: '事故 → 问题' },
      { from: /morgen/gi, to: 'heute', meaning: '明天 → 今天' },
    ]
    for (const p of patterns) {
      if (p.from.test(allGerman)) {
        subs.push({ original: p.from.source, replacement: p.to, meaning: p.meaning })
      }
    }
    return subs.slice(0, 6)
  }

  const generateExtendedPrompt = () => {
    const topics = [
      { german: 'Erzähl von einem Mal, wo du zu spät zur Arbeit gekommen bist. Was ist passiert?', chinese: '讲一次你上班迟到的经历。发生了什么事？' },
      { german: 'Welches Verkehrsmittel benutzt du jeden Tag? Warum?', chinese: '你每天用什么交通工具？为什么？' },
      { german: 'Hast du schon mal eine wichtige Besprechung verpasst? Was hast du gemacht?', chinese: '你有没有错过重要会议？你怎么处理的？' },
      { german: 'Was machst du, wenn der Bus nicht kommt?', chinese: '如果公交不来，你怎么办？' },
      { german: 'Hast du schon mal darüber nachgedacht, das Fahrrad zu nehmen? Warum oder warum nicht?', chinese: '你有没有想过骑车？为什么？' },
      { german: 'Was findest du besser: Monatskarte oder Einzeltickets? Begründe deine Antwort.', chinese: '你觉得月票好还是单程票好？说明理由。' },
    ]
    return topics[Math.floor(Math.random() * topics.length)]
  }

  const handleParse = () => {
    if (!text.trim() || text.trim().length < 20) return
    setParsing(true)
    setTimeout(() => {
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
      let title = '口语课内容'
      let lessonNum = ''
      const titleLine = lines.find(l => l.includes('蜜蜂德语'))
      if (titleLine) title = titleLine
      const lessonLine = lines.find(l => /第.+?节课|第.+?次课/.test(l))
      if (lessonLine) lessonNum = lessonLine
      
      const dialogues: {speaker: string; chinese: string; german: string}[] = []
      let currentSpeaker = 'A'
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        if (line.includes('蜜蜂德语') || /第.+?节课|第.+?次课/.test(line)) continue
        
        const speakerMatch = line.match(/^([AB])[:：]\s*(.+)/)
        if (speakerMatch) {
          currentSpeaker = speakerMatch[1]
          const content = speakerMatch[2].trim()
          const hasChinese = /[\u4e00-\u9fff]/.test(content)
          const hasGerman = /[a-zäöüß]/i.test(content)
          
          if (hasChinese && !hasGerman) {
            let germanLine = ''
            for (let j = i + 1; j < lines.length && j < i + 3; j++) {
              const nextLine = lines[j]
              if (/^[AB][:：]/.test(nextLine)) break
              if (/[a-zäöüß]/i.test(nextLine) && !/[\u4e00-\u9fff]/.test(nextLine)) {
                germanLine = nextLine.trim()
                break
              }
            }
            if (germanLine) {
              dialogues.push({ speaker: currentSpeaker, chinese: content, german: germanLine })
            }
          } else if (hasGerman && !hasChinese) {
            let chineseLine = ''
            for (let j = i - 1; j >= 0 && j >= i - 2; j--) {
              const prevLine = lines[j]
              if (/^[AB][:：]/.test(prevLine)) {
                const prevContent = prevLine.replace(/^[AB][:：]\s*/, '').trim()
                if (/[\u4e00-\u9fff]/.test(prevContent) && !/[a-zäöüß]/i.test(prevContent)) {
                  chineseLine = prevContent
                  break
                }
              }
            }
            if (chineseLine) {
              dialogues.push({ speaker: currentSpeaker, chinese: chineseLine, german: content })
            }
          }
        }
      }
      
      const uniqueDialogues = dialogues.filter((d, i, arr) => 
        arr.findIndex(t => t.german === d.german) === i
      )
      
      const allPhrases: {german: string; chinese: string; context: string}[] = []
      for (const d of uniqueDialogues) {
        const phrases = extractPhrases(d.german, d.chinese)
        allPhrases.push(...phrases)
      }
      
      const uniquePhrases = allPhrases.filter((p, i, arr) => 
        arr.findIndex(t => t.german === p.german) === i
      ).slice(0, 20)
      
      const substitutions = generateSubstitutions(uniqueDialogues)
      const extendedPrompt = generateExtendedPrompt()
      
      const result = {
        title,
        lessonNum,
        phrases: uniquePhrases,
        dialogues: uniqueDialogues,
        substitutions,
        extendedPrompt
      }
      
      setParsed(result)
      saveMaterial({ ...result, date: new Date().toISOString() })
      setParsing(false)
    }, 800)
  }

  return (
    <div className="space-y-3 pb-24">
      <h1 className="text-lg font-bold text-amber-400">📚 Meine Lehrmaterialien</h1>
      
      <Card className="bg-slate-900 border-slate-700 border-l-4 border-l-amber-500">
        <CardContent className="p-3 space-y-2">
          <p className="text-xs text-slate-400">粘贴口语课内容（支持中文+德语对照格式，如 A：... / 德语）</p>
          <Textarea
            placeholder="例如：&#10;A：今天早上地铁停了很久，我差点迟到。&#10;Heute Morgen ist die U-Bahn ewig nicht losgefahren..."
            value={text}
            onChange={e => setText(e.target.value)}
            className="bg-slate-950 border-slate-700 text-slate-100 min-h-[180px] text-sm"
          />
          <Button className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold" onClick={handleParse} disabled={parsing}>
            {parsing ? '⏳ 智能解析中...' : '🔍 解析并生成扩展练习'}
          </Button>
        </CardContent>
      </Card>

      {savedMaterials.length > 0 && (
        <div className="text-xs text-slate-500">已保存 {savedMaterials.length} 节课的内容</div>
      )}

      {parsed && (
        <>
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-3">
              <div className="text-sm font-bold text-amber-400">{parsed.title}</div>
              {parsed.lessonNum && <div className="text-xs text-slate-500">{parsed.lessonNum}</div>}
              <div className="text-xs text-slate-400 mt-1">{parsed.dialogues.length} 组对话 · {parsed.phrases.length} 个口语词组 · {parsed.substitutions.length} 个替换练习</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700 border-l-4 border-l-green-500">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-amber-400">💥 口语词组 · {parsed.phrases.length} 个核心表达</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {parsed.phrases.map((p, i) => (
                <div key={i} className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="text-amber-400 font-semibold text-sm">{p.german}</span>
                      <p className="text-xs text-slate-400 mt-0.5">{p.chinese}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">💬 {p.context}</p>
                    </div>
                    <button className="text-amber-400 text-xs bg-amber-500/10 rounded-full w-7 h-7 flex items-center justify-center shrink-0" onClick={() => speakGerman(p.german)}>🔊</button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-amber-400">💬 对话原文 · {parsed.dialogues.length} 组</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {parsed.dialogues.map((d, i) => (
                <div key={i} className={`bg-slate-950 rounded-lg p-3 border ${d.speaker === 'A' ? 'border-l-2 border-l-blue-500' : 'border-l-2 border-l-pink-500'}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${d.speaker === 'A' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'}`}>{d.speaker}</span>
                    <span className="text-[10px] text-slate-500">{d.chinese}</span>
                  </div>
                  <p className="text-sm text-slate-200">{d.german}</p>
                  <button className="text-amber-400 text-xs mt-1 bg-amber-500/10 rounded-full w-7 h-7 flex items-center justify-center" onClick={() => speakGerman(d.german)}>🔊</button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700 border-l-4 border-l-purple-500">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-amber-400">🔄 替换练习 · 词汇替换</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-slate-400">把对话中的词替换成新词，重新说一遍</p>
              {parsed.substitutions.map((s, i) => (
                <div key={i} className="bg-slate-950 rounded-lg p-2.5 border border-slate-800 flex items-center gap-2">
                  <span className="text-slate-400 text-xs line-through">{s.original}</span>
                  <span className="text-purple-400 text-xs">→</span>
                  <span className="text-amber-400 text-xs font-semibold">{s.replacement}</span>
                  <span className="text-[10px] text-slate-600 ml-auto">{s.meaning}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700 border-l-4 border-l-blue-500">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-amber-400">🎤 延伸口语题 · 基于本课主题</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm font-medium text-slate-200">{parsed.extendedPrompt.german}</p>
              <p className="text-xs text-slate-400">{parsed.extendedPrompt.chinese}</p>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500" onClick={() => speakGerman(parsed.extendedPrompt.german)}>🔊 朗读题目</Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-700 border-l-4 border-l-amber-500">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-amber-400">💡 训练建议</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-xs text-slate-400">
              <p>1. <b className="text-slate-300">先听对话</b>：点击🔊听每个对话片段的朗读</p>
              <p>2. <b className="text-slate-300">词组跟读</b>：逐个跟读口语词组，注意语调和重音</p>
              <p>3. <b className="text-slate-300">替换练习</b>：用新词替换原词，自己造新句子</p>
              <p>4. <b className="text-slate-300">延伸话题</b>：用本课学到的表达回答延伸口语题</p>
              <p>5. <b className="text-slate-300">录音对比</b>：录下自己的回答，和原对话对比发音</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function ProgressPage() {
  const [progressData, setProgressData] = useState({
    streak: 0,
    bestStreak: 0,
    totalMinutes: 0,
    totalVocab: 0,
    masteredVocab: 0,
    doneDays: [] as number[],
    lastPracticeDate: null as string | null,
  })

  useEffect(() => {
    const raw = localStorage.getItem('deutsch-progress')
    if (raw) {
      try {
        setProgressData(JSON.parse(raw))
      } catch {}
    }
  }, [])

  const today = new Date().getDate()
  const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
  const currentMonth = monthNames[new Date().getMonth()]
  const currentYear = new Date().getFullYear()

  const daysInMonth = new Date(currentYear, new Date().getMonth() + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const firstDayOfWeek = new Date(currentYear, new Date().getMonth(), 1).getDay()
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  const weekDays = ['M', 'D', 'M', 'D', 'F', 'S', 'S']

  const completionRate = progressData.totalVocab > 0
    ? Math.round((progressData.masteredVocab / progressData.totalVocab) * 100)
    : 0

  return (
    <div className="space-y-3 pb-24">
      <h1 className="text-lg font-bold text-amber-400">📊 Fortschritts-Tracker · 进度追踪</h1>

      <Card className="bg-slate-900 border-slate-700 text-center p-4 border border-amber-500/20">
        <div className="text-3xl">🔥</div>
        <div className="text-4xl font-extrabold text-amber-400">{progressData.streak}</div>
        <div className="text-xs text-slate-400">Tage in Folge · 连续打卡</div>
        <div className="text-[10px] text-slate-500 mt-1">Beste: {progressData.bestStreak} · Ziel: 30</div>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Card className="bg-slate-900 border-slate-700 text-center p-3">
          <div className="text-xl font-bold text-amber-400">{(progressData.totalMinutes / 60).toFixed(1)}h</div>
          <div className="text-[10px] text-slate-400">总时长</div>
        </Card>
        <Card className="bg-slate-900 border-slate-700 text-center p-3">
          <div className="text-xl font-bold text-amber-400">{progressData.totalVocab}</div>
          <div className="text-[10px] text-slate-400">已学词组</div>
        </Card>
        <Card className="bg-slate-900 border-slate-700 text-center p-3">
          <div className="text-xl font-bold text-green-400">{progressData.masteredVocab}</div>
          <div className="text-[10px] text-slate-400">已掌握</div>
        </Card>
        <Card className="bg-slate-900 border-slate-700 text-center p-3">
          <div className="text-xl font-bold text-blue-400">{completionRate}%</div>
          <div className="text-[10px] text-slate-400">掌握率</div>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">📅 {currentMonth} {currentYear} · 打卡日历</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((d, i) => <div key={i} className="text-center text-[10px] text-slate-500 py-1">{d}</div>)}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {days.map(d => {
              const isDone = progressData.doneDays.includes(d)
              const isToday = d === today
              const cls = isDone
                ? 'bg-green-500/20 text-green-400 border-green-500/40'
                : isToday
                  ? 'border-amber-500 text-amber-400 font-bold'
                  : 'text-slate-600 border-slate-800'
              return <div key={d} className={`aspect-square flex items-center justify-center text-[10px] rounded-md border ${cls}`}>{d}</div>
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-700">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">🗺️ CEFR Level-Karte</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-1">
            {[{ l: 'A1', s: 'passed' }, { l: 'A2', s: 'current' }, { l: 'B1', s: 'future' }, { l: 'B2', s: 'future' }].map((n, i, arr) => (
              <div key={i} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${n.s === 'passed' ? 'bg-green-500/20 text-green-400 border-green-500' : n.s === 'current' ? 'bg-amber-500/20 text-amber-400 border-amber-500 animate-pulse' : 'bg-slate-800 text-slate-600 border-slate-700'}`}>{n.l}</div>
                {i < arr.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${n.s === 'passed' ? 'bg-green-500' : 'bg-slate-700'}`} />}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-2">当前: A1-早期 · 目标: 6个月达到B1口语流利</p>
        </CardContent>
      </Card>
    </div>
  )
}
// ─── Audio Library Page ──────────────────────────────────────────────
function AudioLibraryPage() {
  const [filterLevel, setFilterLevel] = useState<string>('all')

  const resources = [
    {
      title: 'German with Max · A1 故事播客',
      desc: '87集A1级别德语故事，跟随Max和朋友们的日常冒险。每集2-4分钟，语速适中，适合初学者跟读。',
      level: 'A1',
      category: '故事 / 日常',
      url: 'https://germanwithmax.com/en/podcasts/a1',
      episodes: 87,
      features: ['免费', '连载故事', '日常对话'],
      recommended: true,
    },
    {
      title: 'Slow German · 慢速德语播客',
      desc: '德国播客主持人Annik Rubens用慢速德语讲述德国文化、社会和时事话题。免费MP3+PDF文本，语速清晰。',
      level: 'B1-B2',
      category: '文化 / 时事',
      url: 'https://slowgerman.com/',
      rss: 'https://slowgerman.com/feed/podcast',
      episodes: 322,
      features: ['免费', 'PDF文本', '时事话题', '文化深度'],
      recommended: false,
    },
    {
      title: 'DW Deutsch - Warum Nicht? · 系列1',
      desc: 'Deutsche Welle和歌德学院联合制作的经典德语音频课程。共4季104课，从A1到B1。第一季最适合A1初学者。',
      level: 'A1',
      category: '系统课程',
      url: 'https://learngerman.dw.com/en/deutsch-warum-nicht-series-1/c-36525008',
      episodes: 26,
      features: ['免费', '系统课程', '配套练习', 'Goethe认证'],
      recommended: true,
    },
    {
      title: 'DW Nico\'s Weg · A1',
      desc: 'DW的A1级别德语视频课程。Nico从西班牙来到德国，学习德语并找到工作。语速慢，配有字幕，非常适合入门。',
      level: 'A1',
      category: '视频课程',
      url: 'https://learngerman.dw.com/en/nicos-weg/c-36525008',
      episodes: 50,
      features: ['免费', '视频', '字幕', '情境学习'],
      recommended: true,
    },
    {
      title: 'Coffee Break German · 初学者',
      desc: '由母语老师教授的结构化德语课程。从基础问候到日常对话，每集约15-20分钟，讲解清晰。',
      level: 'A1-A2',
      category: '课程 / 播客',
      url: 'https://coffeebreakgerman.com/',
      episodes: 40,
      features: ['结构化', '双语讲解', '循序渐进'],
      recommended: false,
    },
  ]

  const levels = ['all', 'A1', 'A1-A2', 'B1-B2']
  const filtered = filterLevel === 'all' ? resources : resources.filter(r => r.level.includes(filterLevel))

  const levelColor = (l: string) => {
    if (l === 'A1') return 'bg-green-500/20 text-green-400 border-green-500/40'
    if (l.includes('A2')) return 'bg-blue-500/20 text-blue-400 border-blue-500/40'
    return 'bg-purple-500/20 text-purple-400 border-purple-500/40'
  }

  return (
    <div className="space-y-3 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-amber-400">🎧 Audio-Bibliothek · 音频库</h1>
      </div>
      <p className="text-xs text-slate-400">精选 A1 级别外部音频资源，点击收听原站内容</p>

      {/* Level filter */}
      <div className="flex flex-wrap gap-1.5">
        {levels.map(l => (
          <button key={l} onClick={() => setFilterLevel(l)}
            className={`text-xs px-2.5 py-1 rounded-full border transition ${filterLevel===l ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
            {l === 'all' ? '全部' : l}
          </button>
        ))}
      </div>

      {/* Resource cards */}
      <div className="space-y-3">
        {filtered.map((r, i) => (
          <Card key={i} className={`bg-slate-900 border-slate-700 ${r.recommended ? 'border-amber-500/30' : ''}`}>
            <CardContent className="p-3 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-slate-100">{r.title}</span>
                    {r.recommended && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">⭐ 推荐</span>}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${levelColor(r.level)}`}>{r.level}</span>
                    <span className="text-[10px] text-slate-500">{r.category}</span>
                    <span className="text-[10px] text-slate-500">{r.episodes} 集</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
              <div className="flex flex-wrap gap-1">
                {r.features.map((f, j) => (
                  <span key={j} className="text-[10px] bg-slate-950 px-1.5 py-0.5 rounded text-slate-500">{f}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold"
                  onClick={() => window.open(r.url, '_blank')}>
                  🎧 去收听
                </Button>
                {r.rss && (
                  <Button size="sm" variant="outline" className="border-slate-600 text-slate-400 hover:text-amber-400"
                    onClick={() => window.open(r.rss, '_blank')}>
                    📶 RSS
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tips */}
      <Card className="bg-slate-900 border-slate-700 border-l-4 border-l-blue-500">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-amber-400">💡 使用建议</CardTitle></CardHeader>
        <CardContent className="space-y-1.5 text-xs text-slate-400">
          <p>1. <b className="text-slate-300">German with Max</b> 最适合你的 A1 水平，建议从第1集开始按顺序听。</p>
          <p>2. 听音频时建议 <b className="text-slate-300">先盲听一遍</b>，再对照文本听第二遍。</p>
          <p>3. <b className="text-slate-300">Shadowing 跟读</b>：播放一句，暂停，模仿发音和语调重复。</p>
          <p>4. Slow German 虽然标注 B1+，但你的被动德语已达 B1-B2，可以作为进阶听力材料。</p>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Bottom Nav ──────────────────────────────────────────────────────
function BottomNav({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const items: { key: Page; icon: string; label: string }[] = [
    { key: 'drill', icon: '🎯', label: '练习' },
    { key: 'vocab', icon: '🏦', label: '词汇' },
    { key: 'phonetic', icon: '🎙️', label: '发音' },
    { key: 'audio', icon: '🎧', label: '音频' },
    { key: 'materials', icon: '📚', label: '课本' },
    { key: 'progress', icon: '📊', label: '进度' },
  ]
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 z-50 pb-safe">
      <div className="flex justify-around items-center h-14 max-w-md mx-auto">
        {items.map(item => (
          <button key={item.key} onClick={() => setPage(item.key)} className={`flex flex-col items-center justify-center w-full h-full transition ${page===item.key?'text-amber-400':'text-slate-500'}`}>
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

// ─── App ─────────────────────────────────────────────────────────────
function App() {
  const [page, setPage] = useState<Page>('drill')
  const [drillData, setDrillData] = useState<DrillData>(DEFAULT_DRILL)
  const [vocabBank] = useState<VocabItem[]>(DEFAULT_VOCAB)

  // Load saved drill data (if any)
  useEffect(() => {
    const saved = loadData()
    if (saved?.drill) setDrillData(saved.drill)
  }, [])

  // Load daily content from JSON (generated by Automation)
  useEffect(() => {
    fetch('./daily-content.json')
      .then(r => r.json())
      .then(data => {
        if (data.todayDrill) {
          setDrillData(data.todayDrill)
          saveData({ drill: data.todayDrill })
        }
      })
      .catch(() => {/* fallback already loaded */})
  }, [])

  // Supplement: fetch news-based content as bonus
  useEffect(() => {
    fetch('https://api.allorigins.win/raw?url=https://www.tagesschau.de/xml/rss2/')
      .then(r => r.text())
      .then(xml => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(xml, 'application/xml')
        const items = doc.querySelectorAll('item')
        const first = items[0]
        if (first) {
          const title = first.querySelector('title')?.textContent || ''
          const desc = first.querySelector('description')?.textContent || ''
          if (title) {
            setDrillData(prev => ({
              ...prev,
              topic: title,
              prompt: { german: `Was denkst du über: ${title}? Erzähl deine Meinung.`, chinese: `你怎么看这个话题：${title}？讲讲你的看法。` },
              shadow: { german: `${title}. ${desc?.slice(0,200) || ''}...`, chinese: '【根据新闻内容自行理解】' }
            }))
            saveData({ drill: { ...drillData, topic: title } })
          }
        }
      })
      .catch(() => {/* fallback already loaded */})
  }, [])
  useEffect(() => {
    // Try to fetch news-based content
    fetch('https://api.allorigins.win/raw?url=https://www.tagesschau.de/xml/rss2/')
      .then(r => r.text())
      .then(xml => {
        const parser = new DOMParser()
        const doc = parser.parseFromString(xml, 'application/xml')
        const items = doc.querySelectorAll('item')
        const first = items[0]
        if (first) {
          const title = first.querySelector('title')?.textContent || ''
          const desc = first.querySelector('description')?.textContent || ''
          if (title) {
            setDrillData(prev => ({
              ...prev,
              topic: title,
              prompt: { german: `Was denkst du über: ${title}? Erzähl deine Meinung.`, chinese: `你怎么看这个话题：${title}？讲讲你的看法。` },
              shadow: { german: `${title}. ${desc?.slice(0,200) || ''}...`, chinese: '【根据新闻内容自行理解】' }
            }))
            saveData({ drill: { ...drillData, topic: title } })
          }
        }
      })
      .catch(() => {/* fallback already loaded */})
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 max-w-md mx-auto">
      <main className="p-4 pt-6">
        {page === 'drill' && <DrillPage data={drillData} />}
        {page === 'vocab' && <VocabPage vocab={vocabBank} />}
        {page === 'phonetic' && <PhoneticPage />}
        {page === 'audio' && <AudioLibraryPage />}
        {page === 'materials' && <MaterialsPage />}
        {page === 'progress' && <ProgressPage />}
      </main>
      <BottomNav page={page} setPage={setPage} />
    </div>
  )
}

export default App
