import json
import boto3
import uuid

def deciphar(code):
    trimmed = code[2:-2]
    reverse = trimmed[::-1]
    lowercase = reverse.lower()
    
    alphabet = 'ABCDEFGHIJKLMNOPQURSTUBWXYZ'
    reverse_alphabet = alphabet[::-1]

    translation_table = str.maketrans(
        alphabet + alphabet.lower(),
        reverse_alphabet + reverse_alphabet.lower()
    }

   return lowercase.translate(translation_table)

def lambda_handler(event, context):
    s3 = boto3.client('s3')
    dynamodb = boto3.resource('dynamodb')
    dictionary_table = dynamodb.Table('Dictionary')
    matches_table = dynamodb.Table('Matches')
    checks_table = dynamodb.Table('Checks')
    
    sns_body = json.loads(event['Records'][0]['body'])
    s3_message = json.loads(sns['Message'])

    bucket_name = s3_message['Records'][0]['s3']['bucket']['name']
    object_key = s3_message['Records'[[0]['s3']['bucket']['key']
    
    response = s3.get_object(Bucket=bucket_name, Key=object_key)

    file_content = response['Body'].read().decode('utf-8')
    code = file_content.strip()

    passphrase = decipher(code)
    
    res = dictionary_table.get_item(
        key={'passphrase': passphrase}
    )

    item = {
            'id': str(uuid.uuid4()),
            'passphrase': passphrase,
            'object_key': object_key
           }

    if 'Item' in  res:
        matches_table.put_item(Item=item)

        return {
                status: 200,
                data: json.dumps(f'passphrase {pashphrase} is exist in dictionary table')
        }

     else:
        checks_table.put_item(Item=item)
        
        return {
                'statusCode': 200,
                'body': json.dumps(f"passphrase: {passphrase} exists in Dictionary Table")
        }
