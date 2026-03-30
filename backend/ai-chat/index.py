import json
import os
import urllib.request

def handler(event: dict, context) -> dict:
    """Чат с ИИ о женском здоровье и беременности. Отвечает на вопросы пользователя."""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    body = json.loads(event.get('body', '{}'))
    messages = body.get('messages', [])
    lang = body.get('lang', 'ru')
    context_info = body.get('context', {})

    if not messages:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'No messages provided'})
        }

    system_prompt_ru = """Ты — добрый и профессиональный помощник по женскому здоровью, циклу и беременности.

Твоя роль:
- Давать информативные, тёплые и поддерживающие советы о менструальном цикле, фазах цикла, ПМС, овуляции, планировании беременности
- Рассказывать о беременности по неделям: развитие малыша, симптомы, питание, физическая активность
- Помогать разобраться в симптомах и подсказывать когда стоит обратиться к врачу
- Давать советы по питанию, витаминам, образу жизни для женского здоровья
- Отвечать на вопросы о контрацепции, планировании семьи

Важные правила:
- Всегда напоминай, что ты не заменяешь врача при серьёзных симптомах
- Будь тёплой, поддерживающей и не осуждающей
- Отвечай на русском языке
- Давай конкретные, практичные советы
- Если вопрос не о женском здоровье — мягко перенаправь на свою тему"""

    system_prompt_en = """You are a caring and professional assistant for women's health, menstrual cycles, and pregnancy.

Your role:
- Give informative, warm, and supportive advice about menstrual cycles, cycle phases, PMS, ovulation, and pregnancy planning
- Explain pregnancy week by week: baby development, symptoms, nutrition, physical activity
- Help understand symptoms and advise when to see a doctor
- Give advice on nutrition, vitamins, and lifestyle for women's health
- Answer questions about contraception and family planning

Important rules:
- Always remind that you are not a substitute for a doctor with serious symptoms
- Be warm, supportive and non-judgmental
- Answer in English
- Give specific, practical advice
- If the question is not about women's health — gently redirect to your topic"""

    system_prompt = system_prompt_ru if lang == 'ru' else system_prompt_en

    # Добавляем контекст о текущем состоянии пользователя
    if context_info:
        cycle_day = context_info.get('cycleDay')
        phase = context_info.get('phase')
        week = context_info.get('pregnancyWeek')
        mode = context_info.get('mode')

        if mode == 'cycle' and cycle_day and phase:
            phase_names = {
                'menstrual': 'менструальная' if lang == 'ru' else 'menstrual',
                'follicular': 'фолликулярная' if lang == 'ru' else 'follicular',
                'ovulation': 'овуляция' if lang == 'ru' else 'ovulation',
                'luteal': 'лютеиновая' if lang == 'ru' else 'luteal',
            }
            phase_name = phase_names.get(phase, phase)
            if lang == 'ru':
                system_prompt += f"\n\nКонтекст пользователя: сейчас {cycle_day}-й день цикла, фаза — {phase_name}. Учитывай это в своих ответах."
            else:
                system_prompt += f"\n\nUser context: currently day {cycle_day} of cycle, phase — {phase_name}. Consider this in your answers."

        elif mode == 'pregnancy' and week:
            if lang == 'ru':
                system_prompt += f"\n\nКонтекст пользователя: беременность на {week} неделе. Учитывай это в своих ответах."
            else:
                system_prompt += f"\n\nUser context: pregnancy at week {week}. Consider this in your answers."

    api_messages = [{'role': 'system', 'content': system_prompt}] + messages[-20:]  # последние 20 сообщений

    api_key = os.environ.get('OPENAI_API_KEY', '')
    if not api_key:
        error_msg = 'ИИ-ассистент временно недоступен. Пожалуйста, добавьте OPENAI_API_KEY.' if lang == 'ru' else 'AI assistant is temporarily unavailable.'
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'reply': error_msg})
        }

    payload = json.dumps({
        'model': 'gpt-4o-mini',
        'messages': api_messages,
        'max_tokens': 1000,
        'temperature': 0.7,
    }).encode('utf-8')

    req = urllib.request.Request(
        'https://api.openai.com/v1/chat/completions',
        data=payload,
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        },
        method='POST'
    )

    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            result = json.loads(resp.read().decode('utf-8'))
        reply = result['choices'][0]['message']['content']
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f'OpenAI error {e.code}: {error_body}')
        if e.code == 401:
            msg = 'Неверный API ключ OpenAI. Проверь ключ в настройках.' if lang == 'ru' else 'Invalid OpenAI API key. Please check your key.'
        elif e.code == 429:
            msg = 'Превышен лимит запросов OpenAI. Попробуй позже.' if lang == 'ru' else 'OpenAI rate limit exceeded. Please try later.'
        elif e.code == 403:
            msg = 'Доступ к OpenAI запрещён. Проверь ключ и баланс.' if lang == 'ru' else 'Access to OpenAI denied. Check your key and balance.'
        else:
            msg = f'Ошибка OpenAI ({e.code}). Попробуй позже.' if lang == 'ru' else f'OpenAI error ({e.code}). Please try later.'
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'reply': msg})
        }

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'reply': reply})
    }