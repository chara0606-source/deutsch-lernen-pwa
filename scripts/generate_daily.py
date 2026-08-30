#!/usr/bin/env python3
"""
Daily drill generator for Deutsch Lernen PWA.
Run this script to generate today's practice content and push to GitHub.
"""
import json
import os
import subprocess
from datetime import datetime

REPO_DIR = r'C:\Users\CHARA\Documents\kimi\workspace\deutsch-lernen-pwa'
JSON_PATH = os.path.join(REPO_DIR, 'public', 'daily-content.json')

# A1 drill templates - 14 days rotation
DRILL_TEMPLATES = [
    {
        "topic": "Im Supermarkt einkaufen · 超市购物",
        "warmup": {"german": "Blaukraut bleibt Blaukraut und Brautkleid bleibt Brautkleid.", "chinese": "紫甘蓝还是紫甘蓝，婚纱还是婚纱。（练习/au/音）"},
        "vocab": [
            {"word": "der Einkaufswagen", "sentence": "Wo finde ich einen Einkaufswagen?", "translation": "购物车在哪里？"},
            {"word": "die Kasse", "sentence": "An welcher Kasse kann ich bezahlen?", "translation": "我可以在哪个收银台付款？"},
            {"word": "das Angebot", "sentence": "Dieses Brot ist heute im Angebot.", "translation": "这个面包今天特价。"},
            {"word": "frisch", "sentence": "Sind die Tomaten noch frisch?", "translation": "这些西红柿还新鲜吗？"},
            {"word": "die Packung", "sentence": "Ich nehme eine Packung Milch.", "translation": "我拿一包牛奶。"}
        ],
        "prompt": {"german": "Beschreib deinen letzten Einkauf. Was hast du gekauft? Wie viel hast du bezahlt?", "chinese": "描述你上次购物的经历。你买了什么？付了多少钱？（目标：60秒口述）"},
        "shadow": {"german": "Guten Tag! Kann ich Ihnen helfen? – Ja, ich suche frisches Brot. – Das Brot ist hier in der Ecke. Möchten Sie noch etwas? – Ja, eine Packung Butter und zwei Flaschen Wasser. – Das macht zusammen 8 Euro 50. – Bitte schön. – Danke schön! Tschüss!", "chinese": "您好！我能帮您吗？— 是的，我在找新鲜面包。— 面包在那边的角落里。您还要别的吗？— 是的，一包黄油和两瓶水。— 一共8欧元50分。— 给您。— 谢谢！再见！"},
        "debate": {"question": "Soll man immer frisch einkaufen oder ist Tiefkühlkost auch okay?", "translation": "应该总是买新鲜的，还是冷冻食品也可以？", "points": [{"side": "Pro", "text": "Frisches Essen ist gesünder und schmeckt besser."}, {"side": "Contra", "text": "Frisch einkaufen kostet mehr Zeit und Geld."}, {"side": "Pro", "text": "Tiefkühlkost ist praktisch und man wirft weniger weg."}, {"side": "Contra", "text": "Tiefkühlkost hat oft weniger Vitamine."}]}
    },
    {
        "topic": "Sich vorstellen · 自我介绍",
        "warmup": {"german": "Wenn hinter Fliegen Fliegen fliegen, fliegen Fliegen Fliegen nach.", "chinese": "如果苍蝇后面有苍蝇在飞，那么苍蝇会跟着苍蝇飞。（练习/f/和/fl/音）"},
        "vocab": [
            {"word": "sich vorstellen", "sentence": "Darf ich mich kurz vorstellen?", "translation": "我可以简短介绍一下自己吗？"},
            {"word": "der Wohnort", "sentence": "Mein Wohnort ist München.", "translation": "我的居住地是慕尼黑。"},
            {"word": "die Herkunft", "sentence": "Meine Herkunft ist China.", "translation": "我来自中国。"},
            {"word": "das Alter", "sentence": "Mein Alter ist 25 Jahre.", "translation": "我25岁。"},
            {"word": "die Muttersprache", "sentence": "Meine Muttersprache ist Chinesisch.", "translation": "我的母语是中文。"}
        ],
        "prompt": {"german": "Stell dich vor! Sage deinen Namen, woher du kommst, wo du wohnst und was dein Hobby ist.", "chinese": "介绍一下你自己！说说你的名字、来自哪里、住在哪里、爱好是什么。（目标：60秒口述）"},
        "shadow": {"german": "Hallo! Ich heiße Li Wei. Ich komme aus China und wohne jetzt in Berlin. Ich bin 28 Jahre alt. Meine Muttersprache ist Chinesisch, aber ich lerne Deutsch seit einem Jahr. Mein Hobby ist Kochen und Wandern. Freut mich, dich kennenzulernen!", "chinese": "你好！我叫李伟。我来自中国，现在住在柏林。我28岁。我的母语是中文，但我学德语已经一年了。我的爱好是烹饪和徒步。很高兴认识你！"},
        "debate": {"question": "Ist es wichtig, die Muttersprache zu behalten, wenn man im Ausland lebt?", "translation": "在国外生活时，保留母语重要吗？", "points": [{"side": "Pro", "text": "Die Muttersprache ist Teil der eigenen Identität."}, {"side": "Contra", "text": "Man sollte sich voll auf die neue Sprache konzentrieren."}, {"side": "Pro", "text": "Zweisprachigkeit ist gut für das Gehirn."}, {"side": "Contra", "text": "Wenn man beide Sprachen mischt, lernt man keine richtig."}]}
    },
    {
        "topic": "Beim Arzt · 看医生",
        "warmup": {"german": "Zwischen zwei Zwetschgenzweigen sitzen zwei Schwalben.", "chinese": "两只燕子坐在两棵李子树枝之间。（练习/z/和/sch/音）"},
        "vocab": [
            {"word": "der Termin", "sentence": "Ich habe einen Termin bei Dr. Müller.", "translation": "我和 Müller 医生有约。"},
            {"word": "die Beschwerden", "sentence": "Welche Beschwerden haben Sie?", "translation": "您有什么不适？"},
            {"word": "das Fieber", "sentence": "Ich habe seit gestern Fieber.", "translation": "我从昨天开始发烧。"},
            {"word": "die Tablette", "sentence": "Nehmen Sie diese Tabletten dreimal am Tag.", "translation": "这些药片每天服用三次。"},
            {"word": "sich ausruhen", "sentence": "Sie sollten sich ein paar Tage ausruhen.", "translation": "您应该休息几天。"}
        ],
        "prompt": {"german": "Du bist krank und gehst zum Arzt. Beschreib deine Symptome und was der Arzt dir gesagt hat.", "chinese": "你生病了去看医生。描述你的症状和医生对你说的话。（目标：60秒口述）"},
        "shadow": {"german": "Guten Morgen, Frau Müller. Was kann ich für Sie tun? – Guten Morgen, Doktor. Ich fühle mich seit drei Tagen nicht gut. Ich habe Kopfschmerzen und Husten. – Haben Sie Fieber? – Ja, gestern hatte ich 38,5 Grad. – Ich höre mal kurz Ihre Lunge. Atmen Sie tief ein. – Ja, Doktor. – Das ist eine leichte Erkältung. Ich gebe Ihnen ein Rezept. Trinken Sie viel und ruhen Sie sich aus!", "chinese": "早上好，Müller 女士。我能为您做什么？— 早上好，医生。我这三天感觉不舒服。我头痛还咳嗽。— 您发烧吗？— 是的，昨天我38.5度。— 让我听一下您的肺部。深呼吸。— 好的，医生。— 这是轻微感冒。我给您开个处方。多喝水，好好休息！"},
        "debate": {"question": "Soll man bei einer Erkältung sofort zum Arzt gehen oder erst zu Hause bleiben?", "translation": "感冒时应该立刻去看医生，还是先在家休息？", "points": [{"side": "Pro (Arzt)", "text": "Ein Arzt kann schnell die richtige Diagnose stellen."}, {"side": "Contra (Arzt)", "text": "Im Wartezimmer steckt man sich noch mehr an."}, {"side": "Pro (Zuhause)", "text": "Ruhe und viel Trinken helfen oft am besten."}, {"side": "Contra (Zuhause)", "text": "Ohne Arzt kann eine kleine Erkältung schlimmer werden."}]}
    },
    {
        "topic": "Im Restaurant · 餐厅点餐",
        "warmup": {"german": "Schneiders Schneider schneidet schicke Schuhe.", "chinese": "施奈德的裁缝剪裁时髦的鞋子。（练习/sch/音）"},
        "vocab": [
            {"word": "die Speisekarte", "sentence": "Könnten wir bitte die Speisekarte sehen?", "translation": "我们可以看一下菜单吗？"},
            {"word": "die Reservierung", "sentence": "Ich habe eine Reservierung auf den Namen Li.", "translation": "我有一个预约，姓李。"},
            {"word": "die Rechnung", "sentence": "Die Rechnung, bitte!", "translation": "请结账！"},
            {"word": "vegetarisch", "sentence": "Haben Sie auch vegetarische Gerichte?", "translation": "你们也有素食菜品吗？"},
            {"word": "das Trinkgeld", "sentence": "In Deutschland gibt man etwa 10 Prozent Trinkgeld.", "translation": "在德国一般给约10%的小费。"}
        ],
        "prompt": {"german": "Beschreib dein Lieblingsrestaurant. Was bestellst du dort immer? Wie ist das Essen?", "chinese": "描述你最喜欢的餐厅。你在那里总是点什么？食物怎么样？（目标：60秒口述）"},
        "shadow": {"german": "Guten Abend! Haben Sie reserviert? – Ja, einen Tisch für zwei Personen. – Bitte schön, hier entlang. Hier ist die Speisekarte. – Danke. Ich nehme die Tomatensuppe und das Wiener Schnitzel. – Sehr gerne. Möchten Sie auch etwas trinken? – Ja, ein großes Mineralwasser, bitte. – Alles klar. Das kommt sofort!", "chinese": "晚上好！您有预约吗？— 是的，两人桌。— 请这边走。这是菜单。— 谢谢。我要番茄汤和维也纳炸肉排。— 好的。您想喝点什么？— 是的，一大瓶矿泉水，谢谢。— 好的。马上来！"},
        "debate": {"question": "Soll man in Restaurants immer Trinkgeld geben?", "translation": "在餐厅应该总是给小费吗？", "points": [{"side": "Pro", "text": "Das Servicepersonal verdient oft wenig und braucht das Trinkgeld."}, {"side": "Contra", "text": "Das Essen ist schon teuer genug, da muss man nicht noch extra zahlen."}, {"side": "Pro", "text": "Trinkgeld ist eine Anerkennung für guten Service."}, {"side": "Contra", "text": "In manchen Ländern ist Trinkgeld unhöflich."}]}
    },
    {
        "topic": "Nach dem Weg fragen · 问路",
        "warmup": {"german": "Bäcker backt braune Bretzeln.", "chinese": "面包师烤棕色碱水结。（练习/b/和/br/音）"},
        "vocab": [
            {"word": "die Richtung", "sentence": "In welche Richtung muss ich gehen?", "translation": "我应该往哪个方向走？"},
            {"word": "die Kreuzung", "sentence": "Gehen Sie bis zur nächsten Kreuzung.", "translation": "走到下一个十字路口。"},
            {"word": "geradeaus", "sentence": "Gehen Sie geradeaus und dann links.", "translation": "直走然后左转。"},
            {"word": "die Ampel", "sentence": "An der Ampel sehen Sie die Bank.", "translation": "在红绿灯处您会看到银行。"},
            {"word": "entlang", "sentence": "Gehen Sie den Fluss entlang.", "translation": "沿着河边走。"}
        ],
        "prompt": {"german": "Ein Tourist fragt dich nach dem Weg zum Bahnhof. Erkläre ihm den Weg.", "chinese": "一个游客问你火车站怎么走。给他指路。（目标：60秒口述）"},
        "shadow": {"german": "Entschuldigung, wie komme ich zum Hauptbahnhof? – Gehen Sie hier geradeaus bis zur dritten Kreuzung. Dann biegen Sie rechts ab. Gehen Sie etwa 200 Meter weiter. Die Bahnhofshalle ist auf der linken Seite. Sie können sie nicht verfehlen. – Vielen Dank! – Gern geschehen!", "chinese": "不好意思，请问火车站怎么走？— 从这里直走到第三个十字路口。然后右转。再走大约200米。火车站大厅在左手边。您不会错过的。— 非常感谢！— 不客气！"},
        "debate": {"question": "Ist es besser, sich den Weg zu merken oder immer das Navi zu benutzen?", "translation": "记路线好还是总是用导航好？", "points": [{"side": "Pro (merken)", "text": "Wenn man sich den Weg merkt, lernt man die Stadt besser kennen."}, {"side": "Contra (merken)", "text": "In einer fremden Stadt ist das Navi sicherer."}, {"side": "Pro (Navi)", "text": "Das Navi zeigt immer den schnellsten Weg."}, {"side": "Contra (Navi)", "text": "Wer immer auf das Navi schaut, verpasst die Umgebung."}]}
    },
    {
        "topic": "Freizeit und Hobbys · 爱好与休闲",
        "warmup": {"german": "Fischers Fritz fischt frische Fische.", "chinese": "渔夫的弗里茨钓新鲜的鱼。（经典绕口令）"},
        "vocab": [
            {"word": "die Freizeit", "sentence": "In meiner Freizeit lese ich gerne Bücher.", "translation": "我在空闲时间喜欢看书。"},
            {"word": "das Hobby", "sentence": "Mein Hobby ist Fotografieren.", "translation": "我的爱好是摄影。"},
            {"word": "sich treffen", "sentence": "Wir treffen uns am Wochenende.", "translation": "我们周末见面。"},
            {"word": "der Film", "sentence": "Möchtest du mit ins Kino kommen?", "translation": "你想一起去看电影吗？"},
            {"word": "spazieren gehen", "sentence": "Ich gehe jeden Abend spazieren.", "translation": "我每天晚上散步。"}
        ],
        "prompt": {"german": "Was machst du am Wochenende? Erzähl von deinen Plänen.", "chinese": "你周末做什么？讲讲你的计划。（目标：60秒口述）"},
        "shadow": {"german": "Hallo Anna! Was machst du am Samstag? – Ich habe noch keine Pläne. Und du? – Ich gehe ins Kino. Möchtest du mitkommen? – Ja, gerne! Welchen Film schauen wir? – Einen neuen Actionfilm. Er fängt um 20 Uhr an. – Super! Treffen wir uns vorher zum Essen? – Gute Idee! Um 18 Uhr im Italiener?", "chinese": "嗨 Anna！你周六做什么？— 我还没有计划。你呢？— 我要去看电影。你想一起来吗？— 好啊！我们看什么电影？— 一部新的动作片。晚上8点开始。— 太好了！我们要不要先吃饭？— 好主意！6点在意大利餐厅见？"},
        "debate": {"question": "Ist es besser, am Wochenende zu Hause zu bleiben oder unterwegs zu sein?", "translation": "周末待在家里好还是出门好？", "points": [{"side": "Pro (Zuhause)", "text": "Zu Hause kann man richtig entspannen und Energie tanken."}, {"side": "Contra (Zuhause)", "text": "Wer nur zu Hause sitzt, verpasst viele Erlebnisse."}, {"side": "Pro (unterwegs)", "text": "Neue Erfahrungen machen das Leben interessanter."}, {"side": "Contra (unterwegs)", "text": "Unterwegs sein ist oft teuer und anstrengend."}]}
    },
    {
        "topic": "Wohnen und Miete · 住房与租房",
        "warmup": {"german": "Der Cottbusser Postkutscher putzt den Cottbusser Postkutschkasten.", "chinese": "科特布斯的邮车夫擦拭科特布斯的邮车箱。（练习/k/和/p/音）"},
        "vocab": [
            {"word": "die Miete", "sentence": "Die Miete in Berlin ist sehr hoch.", "translation": "柏林的房租很高。"},
            {"word": "die Wohnung", "sentence": "Ich suche eine Wohnung mit zwei Zimmern.", "translation": "我在找一套两居室的公寓。"},
            {"word": "der Nachbar", "sentence": "Meine Nachbarn sind sehr nett.", "translation": "我的邻居们很好。"},
            {"word": "möbliert", "sentence": "Ist die Wohnung möbliert oder unmöbliert?", "translation": "这套公寓是带家具的还是不带家具的？"},
            {"word": "der Mietvertrag", "sentence": "Bitte lesen Sie den Mietvertrag genau.", "translation": "请仔细阅读租房合同。"}
        ],
        "prompt": {"german": "Beschreib deine Wohnung. Wie viele Zimmer hat sie? Was ist dein Lieblingsplatz?", "chinese": "描述你的公寓。有几个房间？你最喜欢的地方是哪里？（目标：60秒口述）"},
        "shadow": {"german": "Guten Tag! Ich interessiere mich für die Wohnung. – Ja, sie hat zwei Zimmer, eine Küche und ein Bad. – Ist sie möbliert? – Nein, aber es gibt einen Einbauküche. – Wie hoch ist die Miete? – 850 Euro warm. – Kann ich mir die Wohnung ansehen? – Natürlich! Wann haben Sie Zeit?", "chinese": "您好！我对这套公寓感兴趣。— 是的，它有两个房间、一个厨房和一个浴室。— 带家具吗？— 不，但有一个整体厨房。— 房租多少？— 850欧元全包。— 我可以看房吗？— 当然！您什么时候有时间？"},
        "debate": {"question": "Ist es besser, eine Wohnung zu mieten oder zu kaufen?", "translation": "租房好还是买房好？", "points": [{"side": "Pro (mieten)", "text": "Mieten gibt mehr Flexibilität, umzuziehen."}, {"side": "Contra (mieten)", "text": "Beim Mieten zahlt man Geld aus, ohne etwas zu besitzen."}, {"side": "Pro (kaufen)", "text": "Eine eigene Wohnung ist eine gute Investition."}, {"side": "Contra (kaufen)", "text": "Kaufen bindet viel Kapital und man kann nicht so leicht umziehen."}]}
    }
]

def generate_today_drill():
    """Select drill based on day of month, cycling through templates."""
    day = datetime.now().day
    idx = day % len(DRILL_TEMPLATES)
    return DRILL_TEMPLATES[idx]

def update_daily_content():
    """Update daily-content.json with today's drill."""
    # Load existing content to preserve user uploads
    data = {"version": "1.0", "lastUpdated": datetime.now().isoformat()}
    if os.path.exists(JSON_PATH):
        with open(JSON_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
    
    # Generate today's drill
    today_drill = generate_today_drill()
    data['todayDrill'] = today_drill
    data['lastUpdated'] = datetime.now().isoformat()
    
    # Save
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Generated drill for {datetime.now().strftime('%Y-%m-%d')}: {today_drill['topic']}")
    return today_drill

def git_push():
    """Commit and push changes to GitHub."""
    os.chdir(REPO_DIR)
    
    # Stage changes
    subprocess.run(['git', 'add', 'public/daily-content.json'], check=True, capture_output=True)
    
    # Check if there are changes to commit
    result = subprocess.run(['git', 'diff', '--cached', '--quiet'], capture_output=True)
    if result.returncode == 0:
        print("No changes to commit.")
        return
    
    # Commit
    date_str = datetime.now().strftime('%Y-%m-%d')
    subprocess.run(['git', 'commit', '-m', f'Update daily drill for {date_str}'], check=True, capture_output=True)
    
    # Push
    result = subprocess.run(['git', 'push', 'origin', 'main'], capture_output=True, text=True, encoding='utf-8')
    if result.returncode == 0:
        print(f"Pushed to GitHub: {date_str}")
    else:
        print(f"Push failed: {result.stderr}")

def deploy_ghpages():
    """Build and deploy dist to gh-pages branch."""
    import shutil
    
    # Build
    npm_cmd = r'C:\Users\CHARA\AppData\Local\Programs\Kimi\resources\resources\runtime\npm.cmd'
    build_result = subprocess.run([npm_cmd, 'run', 'build'], capture_output=True, text=True)
    if build_result.returncode != 0:
        print(f"Build failed: {build_result.stderr}")
        return
    
    # Deploy dist to gh-pages
    gp_dir = os.path.join(os.path.dirname(REPO_DIR), 'gh-pages-auto')
    if os.path.exists(gp_dir):
        shutil.rmtree(gp_dir, ignore_errors=True)
    os.makedirs(gp_dir)
    
    subprocess.run(['git', 'init'], cwd=gp_dir, check=True, capture_output=True)
    subprocess.run(['git', 'config', 'user.email', 'chara0606@gmail.com'], cwd=gp_dir, capture_output=True)
    subprocess.run(['git', 'config', 'user.name', 'chara0606-source'], cwd=gp_dir, capture_output=True)
    
    dist_src = os.path.join(REPO_DIR, 'dist')
    for item in os.listdir(dist_src):
        src = os.path.join(dist_src, item)
        dst = os.path.join(gp_dir, item)
        if os.path.isdir(src):
            shutil.copytree(src, dst)
        else:
            shutil.copy2(src, dst)
    
    subprocess.run(['git', 'add', '.'], cwd=gp_dir, check=True, capture_output=True)
    subprocess.run(['git', 'commit', '-m', f'Auto-deploy {datetime.now().strftime("%Y-%m-%d")}'], cwd=gp_dir, check=True, capture_output=True)
    
    result = subprocess.run(['git', 'push', '-f', 'https://github.com/chara0606-source/deutsch-lernen-pwa.git', 'master:gh-pages'],
        cwd=gp_dir, capture_output=True, text=True, encoding='utf-8')
        cwd=gp_dir, capture_output=True, text=True)
    if result.returncode == 0:
        print("Deployed to gh-pages!")
    else:
        print(f"Deploy failed: {result.stderr}")
    
    shutil.rmtree(gp_dir, ignore_errors=True)

if __name__ == '__main__':
    print("=== Deutsch Lernen Daily Generator ===")
    update_daily_content()
    git_push()
    # Note: GitHub Actions will auto-build and deploy to Pages on push
    print("Done! GitHub Actions will deploy the update.")
    print("=== Deutsch Lernen Daily Generator ===")
    update_daily_content()
    git_push()
    deploy_ghpages()
    print("Done!")
