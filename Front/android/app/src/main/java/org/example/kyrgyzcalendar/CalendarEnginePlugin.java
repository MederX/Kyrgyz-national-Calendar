package org.example.kyrgyzcalendar;

import android.util.Log;
import com.chaquo.python.Python;
import com.chaquo.python.android.AndroidPlatform;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "CalendarEngine")
public class CalendarEnginePlugin extends Plugin {
    private final ExecutorService worker = Executors.newSingleThreadExecutor();

    @PluginMethod
    public void calculate(PluginCall call) {
        worker.execute(() -> {
            try {
                if (!Python.isStarted()) {
                    Python.start(new AndroidPlatform(getContext()));
                }
                String json = Python.getInstance().getModule("calendar_mobile")
                    .callAttr("calculate", call.getData().toString()).toString();
                JSObject result = new JSObject();
                result.put("json", json);
                call.resolve(result);
            } catch (Exception error) {
                Log.e("CalendarEngine", "Local calendar calculation failed", error);
                call.reject("Local calendar calculation failed", error);
            }
        });
    }

    @Override
    protected void handleOnDestroy() {
        worker.shutdownNow();
    }
}
