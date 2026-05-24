package com.example.wildcatsden.events.adapter

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.bumptech.glide.load.model.GlideUrl
import com.bumptech.glide.load.model.LazyHeaders
import com.example.wildcatsden.R
import com.example.wildcatsden.core.utils.ImageUtils
import com.example.wildcatsden.events.models.Event

class EventsAdapter(
    private var events: List<Event> = emptyList()
) : RecyclerView.Adapter<EventsAdapter.EventViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): EventViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_event, parent, false)
        return EventViewHolder(view)
    }

    override fun onBindViewHolder(holder: EventViewHolder, position: Int) {
        holder.bind(events[position])
    }

    override fun getItemCount(): Int = events.size

    fun updateEvents(newEvents: List<Event>) {
        events = newEvents
        notifyDataSetChanged()
    }

    class EventViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val eventImage: ImageView = itemView.findViewById(R.id.eventImage)
        private val eventTitle: TextView = itemView.findViewById(R.id.eventTitle)
        private val eventDate: TextView = itemView.findViewById(R.id.eventDate)

        fun bind(event: Event) {
            eventTitle.text = event.name
            eventDate.text = event.startTime.take(10)

            val resolved = ImageUtils.resolveImageUrl(event.coverPhoto)
            if (!resolved.isNullOrEmpty()) {
                val imageRequest = if (resolved.contains("fbcdn.net") || resolved.contains("facebook.com")) {
                    val headers = LazyHeaders.Builder()
                        .addHeader("User-Agent", "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro Build/TP1A.220624.021; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.0.0 Mobile Safari/537.36")
                        .addHeader("Accept", "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8")
                        .addHeader("Accept-Language", "en-US,en;q=0.9")
                        .addHeader("Accept-Encoding", "gzip, deflate, br")
                        .addHeader("Connection", "keep-alive")
                        .addHeader("Referer", "https://m.facebook.com/")
                        .addHeader("Cache-Control", "no-cache")
                        .addHeader("Pragma", "no-cache")
                        .build()

                    GlideUrl(resolved, headers)
                } else {
                    resolved
                }

                Glide.with(itemView.context)
                    .load(imageRequest)
                    .placeholder(R.drawable.ic_placeholder)
                    .error(R.drawable.ic_placeholder)
                    .into(eventImage)
            } else {
                eventImage.setImageResource(R.drawable.ic_placeholder)
            }
        }
    }
}