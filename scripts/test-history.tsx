// Test script to verify history functionality

// History kaydı tutulan durumlar:
// 1. Section ekleme: "Added section" - detay bilgisi ile
// 2. Section silme: "Deleted section" - hangi section silindiği ile
// 3. Section sıralama: "Reordered sections" - hangi section taşındığı ile
// 4. Section görünürlük: "Showed section" / "Hid section" - section adı ile
// 5. Section güncelleme: "Updated section" - section adı ile (skipHistory false ise)
// 6. Template yükleme: "Loaded template" - sections sıfırlanır
// 7. Draft kaydetme: "Saved draft" - history temizlenir
// 8. Yayınlama: "Published changes" - history temizlenir

console.log(`
History Tracking Summary:
========================

Maximum History: 5 entries

Tracked Actions:
1. Add Section
   - Action: "Added section"
   - Details: Section name and position
   
2. Delete Section
   - Action: "Deleted section"
   - Details: Deleted section name
   
3. Reorder Sections
   - Action: "Reordered sections"
   - Details: Moved section name
   
4. Toggle Visibility
   - Action: "Showed section" / "Hid section"
   - Details: Section name
   
5. Update Section
   - Action: "Updated section"
   - Details: Section name
   - Note: Only if skipHistory is false
   
6. Load Template
   - Action: "Loaded template"
   - Clears history with new state
   
7. Save Draft
   - Action: "Saved draft"
   - Resets history
   
8. Publish Changes
   - Action: "Published changes"
   - Resets history

UI Features:
- Undo/Redo buttons (Ctrl+Z, Ctrl+Y)
- History panel showing last 5 changes
- Click on history item to restore that state
- Relative timestamps (e.g., "2 minutes ago")
`);