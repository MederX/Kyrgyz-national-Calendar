package org.example.kyrgyzcalendar;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(CalendarEnginePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
