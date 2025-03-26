import com.google.gson.JsonDeserializer
import java.text.SimpleDateFormat
import java.util.*
import com.google.gson.JsonElement
import com.google.gson.JsonParseException

class DateDeserializer : JsonDeserializer<Date> {
    override fun deserialize(json: JsonElement, typeOfT: java.lang.reflect.Type, context: com.google.gson.JsonDeserializationContext): Date {
        val dateString = json.asString
        val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSSSSZ", Locale.getDefault())
        return try {
            dateFormat.parse(dateString) ?: throw JsonParseException("Invalid date format")
        } catch (e: Exception) {
            throw JsonParseException("Error parsing date", e)
        }
    }
}
