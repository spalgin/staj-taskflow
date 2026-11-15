# TaskFlow API

**Katılımcı** · Fevzi Emre Karahan

TaskFlow, yazılım ekipleri için görev oluşturma, atama, durum ve öncelik takibi yapan bir Node.js ve Express REST API'sidir. İstek ve yanıt biçimi JSON'dur. Görevler yerel dosyada saklanır ve süreç yeniden başlatıldığında korunur.

## Kurulum

Node.js 22 veya üzeri ve npm gerekir. Repo klasöründe şu komutları çalıştırın.

```sh
npm ci
npm start
```

Sunucu `http://127.0.0.1:3000` adresinde çalışır. İşlemleri durdurmak için sunucunun terminalinde Ctrl+C kullanın. `PORT` ile port, `TASKFLOW_DATA_FILE` ile görev dosyasının yolu değiştirilebilir. Varsayılan dosya `data/tasks.json` olup ilk yazma işleminde oluşturulur. Sunucuyu aynı dosyayı paylaşan birden çok süreç olarak çalıştırmayın.

## API

| Metot | Yol | İşlem | Başarılı durum |
| --- | --- | --- | --- |
| POST | `/tasks` | Görev ekle | 201 |
| GET | `/tasks` | Görevleri listele | 200 |
| GET | `/tasks/:id` | Görev detayı | 200 |
| PUT | `/tasks/:id` | Görev alanlarını değiştir | 200 |
| DELETE | `/tasks/:id` | Görevi sil | 204 |

POST ve PUT için `Content-Type: application/json` kullanın. `title` zorunludur. PUT, düzenlenebilir alanların tamamını değiştirir ve belirtilmeyen alanlar için varsayılan değerleri kullanır. `description` ve `assignee` varsayılan olarak boş metindir. `status` için `pending` (varsayılan), `in_progress` ve `completed` seçenekleri vardır. `priority` için `low`, `medium` (varsayılan) ve `high` seçenekleri vardır.

```json
{
  "title": "Katalog verisini hazırla",
  "description": "Ürün kartlarına örnek veri ekle.",
  "assignee": "Deniz Akın",
  "status": "pending",
  "priority": "medium"
}
```

Sunucu `id`, `createdAt` ve `updatedAt` alanlarını ekler. Geçersiz veri için `400`, bulunamayan görev için `404` ve çok büyük gövde için `413` döner. Logger, istek zamanını ISO 8601 biçiminde, HTTP metodunu ve yolunu terminale yazar.

## Postman ile doğrulama

[`postman/TaskFlow.postman_collection.json`](postman/TaskFlow.postman_collection.json) koleksiyonunu Postman'a aktarın ve sırayla çalıştırın. İlk istek `taskId` değişkenini oluşturur. Koleksiyon yeni görev ekleme, listeleme, detay, güncelleme, silme, silinen kaydı sorgulama ve geçersiz istek senaryolarını kontrol eder. Koleksiyonda `baseUrl` varsayılan olarak `http://127.0.0.1:3000` değerindedir.

Postman CLI ile aynı koleksiyon yerelde çalıştırılabilir.

```sh
npx --yes --package=postman-cli -- postman collection run postman/TaskFlow.postman_collection.json
```

[Tasarım PDF'si](output/pdf/Backend_Gelistirme_TaskFlow_Tasarim.pdf) · [Kurulum PDF'si](output/pdf/Backend_Gelistirme_TaskFlow_Kurulum.pdf)

Örnek yerel çalıştırmada 7 isteğin 14 kontrolü geçti. [Postman CLI raporu](docs/postman/Postman_TaskFlow_Test.html) ve [beş CRUD ekran görüntüsü](docs/postman/) bu çalıştırmadan alındı.
