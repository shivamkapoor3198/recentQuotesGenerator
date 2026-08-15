from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def payload():
    return {
        "invoiceNo": "DM/26-LOCAL-0001",
        "client": "Local Test Client",
        "projectType": "Apartment",
        "location": "Bengaluru",
        "totals": {"subtotal": 1000, "discountPct": 0, "taxPct": 18, "discount": 0, "tax": 180, "total": 1180},
        "items": [{"areaType": "LIVING ROOM", "name": "False Ceiling", "vendor": "Gyproc", "unit": "sq ft", "qty": 10, "rate": 100}],
    }


def test_health():
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json()['ok'] is True


def test_pdf_generation():
    response = client.post('/generate/pdf', json=payload())
    assert response.status_code == 200
    assert response.headers['content-type'].startswith('application/pdf')
    assert response.content.startswith(b'%PDF')


def test_docx_generation():
    response = client.post('/generate/docx', json=payload())
    assert response.status_code == 200
    assert response.headers['content-type'].startswith('application/vnd.openxmlformats-officedocument')
    assert response.content[:2] == b'PK'
